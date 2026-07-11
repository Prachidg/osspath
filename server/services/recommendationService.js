const axios = require("axios");
const { decrypt } = require("../utils/crypto");
const { syncUserProfile } = require("./githubService");
const Issue = require("../models/Issue");
const Recommendation = require("../models/Recommendation");
const Repository = require("../models/Repository");
const User = require("../models/User");
const UserIssueInteraction = require("../models/UserIssueInteraction");
const { cosineSimilarity, embedText } = require("./embeddingService");
const { COLLECTIONS, upsertVector } = require("./vectorService");
const {
  buildMatchReason,
  calculateFreshnessScore,
  calculateMatch,
  calculateRepoHealthDetails,
  calculateReadinessScore,
  inferDifficulty,
} = require("./scoringService");

const GITHUB_API = "https://api.github.com";

const githubHeaders = (accessToken) => ({
  Authorization: `token ${decrypt(accessToken)}`,
  Accept: "application/vnd.github+json",
});

const getCandidateQueries = (user) => {
  const profile = user.skillProfile || {};
  const languages = Object.keys(profile.languageCount || {}).slice(0, 4);
  const topics = (profile.topics || []).slice(0, 4);
  const seedTerms = [...languages, ...topics].filter(Boolean);
  const terms = seedTerms.length ? seedTerms : ["javascript", "react", "node"];

  return terms.slice(0, 6).map((term) => `${term} label:"good first issue" state:open no:assignee`);
};

const searchIssues = async (user) => {
  const seen = new Set();
  const issues = [];
  const queries = getCandidateQueries(user);

  for (let i = 0; i < queries.length; i++) {
    try {
      // Small delay between queries to avoid GitHub search rate limit (30/min)
      if (i > 0) await new Promise((r) => setTimeout(r, 1500));

      const response = await axios.get(`${GITHUB_API}/search/issues`, {
        headers: githubHeaders(user.accessToken),
        params: {
          q: queries[i],
          sort: "updated",
          order: "desc",
          per_page: 8,
        },
      });

      for (const item of response.data.items || []) {
        if (item.pull_request || seen.has(String(item.id))) continue;
        seen.add(String(item.id));
        issues.push(item);
      }
    } catch (err) {
      // GitHub 403 = rate limited, 422 = bad query — continue with what we have
      if (err.response?.status === 403 || err.response?.status === 422) {
        console.warn(`GitHub search rate limited or rejected (${err.response.status}), continuing with ${issues.length} issues collected so far.`);
        break;
      }
      throw err; // Re-throw unexpected errors
    }
  }

  return issues.slice(0, 24);
};

const getRepoFullNameFromIssue = (issue) => {
  const marker = "https://api.github.com/repos/";
  if (!issue.repository_url?.startsWith(marker)) return "";
  return issue.repository_url.replace(marker, "");
};

const fetchRepository = async (fullName, accessToken) => {
  const response = await axios.get(`${GITHUB_API}/repos/${fullName}`, {
    headers: githubHeaders(accessToken),
  });
  return response.data;
};

const upsertRepository = async (repo) => {
  const health = calculateRepoHealthDetails(repo);
  const repositoryVectorId = `repo-${repo.id}`;

  const repository = await Repository.findOneAndUpdate(
    { repoId: String(repo.id) },
    {
      repoId: String(repo.id),
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count || 0,
      topics: repo.topics || [],
      healthScore: health.score,
      healthDetails: health.details,
      busFactorScore: 0,
      openIssues: repo.open_issues_count || 0,
      lastPushedAt: repo.pushed_at,
      embeddingVectorId: repositoryVectorId,
      url: repo.html_url,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  const vector = await embedText(`${repo.full_name} ${repo.description || ""} ${(repo.topics || []).join(" ")} ${repo.language || ""}`);
  await upsertVector({
    collection: COLLECTIONS.repositories,
    id: repositoryVectorId,
    vector,
    payload: { repositoryId: String(repository._id), fullName: repository.fullName, language: repository.language },
  });

  return repository;
};

const upsertIssue = async (githubIssue, repository) => {
  const labels = (githubIssue.labels || []).map((label) => label.name || label);
  const difficulty = inferDifficulty(labels, githubIssue.title, githubIssue.body);
  const issueVectorId = `issue-${githubIssue.id}`;

  const issue = await Issue.findOneAndUpdate(
    { issueId: String(githubIssue.id) },
    {
      issueId: String(githubIssue.id),
      title: githubIssue.title,
      body: githubIssue.body || "",
      labels,
      difficulty,
      freshnessScore: calculateFreshnessScore(githubIssue.created_at, githubIssue.updated_at),
      state: githubIssue.state || "open",
      assignee: githubIssue.assignee?.login,
      repoName: repository.fullName,
      repoUrl: repository.url,
      issueUrl: githubIssue.html_url,
      language: repository.language,
      repositoryId: repository._id,
      embeddingVectorId: issueVectorId,
      createdAt: githubIssue.created_at,
      updatedAt: githubIssue.updated_at,
      lastSyncedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  const vector = await embedText(`${githubIssue.title || ""} ${githubIssue.body || ""} ${labels.join(" ")} ${repository.fullName}`);
  await upsertVector({
    collection: COLLECTIONS.issues,
    id: issueVectorId,
    vector,
    payload: { issueId: String(issue._id), repoName: repository.fullName, difficulty: issue.difficulty },
  });

  return { issue, vector };
};

const generateRecommendations = async (userId) => {
  let user = await User.findById(userId);
  if (!user?.accessToken) {
    throw new Error("GitHub access token is missing for this user.");
  }

  // Auto-sync GitHub profile if the user has never synced (first login)
  if (!user.lastSyncedAt) {
    try {
      const result = await syncUserProfile(user);
      user = result.user;
    } catch (err) {
      console.warn("Auto-sync failed, continuing with current profile:", err.message);
    }
  }

  const readinessScore = calculateReadinessScore(user.skillProfile);
  user.readinessScore = readinessScore;
  user.skillVectorId = `user-${user._id}`;
  await user.save();
  const userVector = await embedText(user.contributionSummary || `${user.skills?.join(" ")} ${JSON.stringify(user.skillProfile || {})}`);

  await upsertVector({
    collection: COLLECTIONS.users,
    id: user.skillVectorId,
    vector: userVector,
    payload: { userId: String(user._id), username: user.username },
  });

  const githubIssues = await searchIssues(user);
  const repoCache = new Map();
  const recommendations = [];

  for (const githubIssue of githubIssues) {
    const fullName = getRepoFullNameFromIssue(githubIssue);
    if (!fullName) continue;

    if (!repoCache.has(fullName)) {
      try {
        const repo = await fetchRepository(fullName, user.accessToken);
        repoCache.set(fullName, await upsertRepository(repo));
      } catch (err) {
        if (err.response?.status === 403) {
          console.warn(`GitHub rate limit hit fetching ${fullName}, skipping remaining repos.`);
          break;
        }
        console.warn(`Failed to fetch repo ${fullName}:`, err.message);
        continue;
      }
    }

    const repository = repoCache.get(fullName);
    const { issue, vector: issueVector } = await upsertIssue(githubIssue, repository);
    const semanticScore = cosineSimilarity(userVector, issueVector);
    const match = calculateMatch({ user, issue, repository, semanticScore });
    const matchReason = buildMatchReason({ issue, repository, matchedSkills: match.matchedSkills });

    const recommendation = await Recommendation.findOneAndUpdate(
      { userId: user._id, issueId: issue._id },
      {
        userId: user._id,
        issueId: issue._id,
        repositoryId: repository._id,
        matchScore: match.matchScore,
        matchReason,
        signals: match.signals,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    )
      .populate("issueId")
      .populate("repositoryId");

    recommendations.push(recommendation);
  }

  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10)
    .map(formatRecommendation);
};

const getRecommendations = async (userId) => {
  const recommendations = await Recommendation.find({ userId })
    .sort({ matchScore: -1, generatedAt: -1 })
    .limit(10)
    .populate("issueId")
    .populate("repositoryId");

  return recommendations.map(formatRecommendation);
};

const recordInteraction = async ({ userId, issueId, status, timeSpent, notes }) => {
  const interaction = await UserIssueInteraction.create({
    userId,
    issueId,
    status,
    timeSpent,
    notes,
  });

  await recalibrateDifficulty(userId);
  return interaction;
};

const recalibrateDifficulty = async (userId) => {
  const interactions = await UserIssueInteraction.find({ userId }).populate("issueId");
  if (!interactions.length) return;

  const completed = interactions.filter((item) => item.status === "completed").length;
  const abandoned = interactions.filter((item) => item.status === "abandoned").length;
  const attempted = interactions.length;
  const completionRate = completed / attempted;

  const difficultyProfile = interactions.reduce((profile, interaction) => {
    const difficulty = interaction.issueId?.difficulty || "beginner";
    profile[difficulty] = profile[difficulty] || { total: 0, attempted: 0, completed: 0, abandoned: 0 };
    profile[difficulty].total += 1;
    profile[difficulty][interaction.status] += 1;
    return profile;
  }, {});

  await User.findByIdAndUpdate(userId, {
    readinessScore: Math.round(Math.max(10, Math.min(96, 45 + completionRate * 40 - abandoned * 2))),
    difficultyProfile,
  });
};

const formatRecommendation = (recommendation) => {
  const issue = recommendation.issueId;
  const repository = recommendation.repositoryId;

  return {
    id: recommendation._id,
    issueId: issue?._id,
    title: issue?.title,
    repo: issue?.repoName || repository?.fullName,
    stars: formatStars(repository?.stars || 0),
    languages: [issue?.language, ...(repository?.topics || []).slice(0, 2)].filter(Boolean),
    difficulty: issue?.difficulty || "beginner",
    matchScore: recommendation.matchScore,
    explanation: recommendation.matchReason,
    url: issue?.issueUrl,
    freshnessScore: issue?.freshnessScore,
    healthScore: repository?.healthScore,
    generatedAt: recommendation.generatedAt,
  };
};

const formatStars = (stars) => {
  if (stars >= 1000) return `${Math.round(stars / 100) / 10}k`;
  return String(stars);
};

module.exports = {
  generateRecommendations,
  getRecommendations,
  recordInteraction,
};
