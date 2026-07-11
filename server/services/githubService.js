const axios = require("axios");
const Repository = require("../models/Repository");
const User = require("../models/User");
const { calculateReadinessScore, calculateRepoHealthDetails } = require("./scoringService");
const { decrypt } = require('../utils/crypto');

const GITHUB_API = "https://api.github.com";

const githubHeaders = (accessToken) => ({
  Authorization: `token ${accessToken}`,
  Accept: "application/vnd.github+json",
});

const githubGet = async (url, accessToken, params = {}) => {
  const response = await axios.get(url, {
    headers: githubHeaders(accessToken),
    params,
  });
  return response.data;
};

const fetchUserRepos = async (accessToken) =>
  githubGet(`${GITHUB_API}/user/repos`, accessToken, {
    per_page: 100,
    sort: "updated",
    affiliation: "owner,collaborator,organization_member",
  });

const fetchRecentEvents = async (username, accessToken) =>
  githubGet(`${GITHUB_API}/users/${username}/events/public`, accessToken, { per_page: 100 }).catch(() => []);

const buildSkillProfile = ({ repos = [], events = [] }) => {
  const languageCount = {};
  const topicsSet = new Set();
  const repoNames = [];
  const eventTypeCount = {};
  const activeHours = {};

  repos.forEach((repo) => {
    if (repo.language) languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
    (repo.topics || []).forEach((topic) => topicsSet.add(topic));
    if (repo.full_name) repoNames.push(repo.full_name);
  });

  events.forEach((event) => {
    eventTypeCount[event.type] = (eventTypeCount[event.type] || 0) + 1;
    const hour = new Date(event.created_at).getUTCHours();
    activeHours[hour] = (activeHours[hour] || 0) + 1;
  });

  const topics = Array.from(topicsSet);
  const skills = [...Object.keys(languageCount), ...topics];
  const activityPattern = {
    activeHours,
    eventTypeCount,
    recentEventCount: events.length,
    peakHourUtc: getTopKey(activeHours),
  };

  const contributionSummary = [
    `Languages: ${Object.entries(languageCount).map(([lang, count]) => `${lang} (${count})`).join(", ") || "unknown"}.`,
    `Topics: ${topics.slice(0, 20).join(", ") || "none detected"}.`,
    `Recent activity: ${Object.entries(eventTypeCount).map(([type, count]) => `${type} ${count}`).join(", ") || "none"}.`,
    `Repositories: ${repoNames.slice(0, 20).join(", ") || "none"}.`,
  ].join(" ");

  return {
    activityPattern,
    contributionSummary,
    githubStats: {
      repoCount: repos.length,
      eventTypeCount,
      updatedRepoCount: repos.filter((repo) => repo.pushed_at).length,
    },
    readinessScore: calculateReadinessScore({ languageCount, topics }),
    skillProfile: { languageCount, topics },
    skills,
  };
};

const syncUserProfile = async (user) => {
  const token = decrypt(user.accessToken);
  const repos = await fetchUserRepos(token);
  const events = await fetchRecentEvents(user.username, token);
  const profile = buildSkillProfile({ repos, events });

  await Promise.all(repos.slice(0, 40).map((repo) => upsertRepositoryFromGithub(repo)));

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      ...profile,
      lastSyncedAt: new Date(),
    },
    { new: true }
  );

  return { repos, events, user: updatedUser, ...profile };
};

const upsertRepositoryFromGithub = async (repo) => {
  const health = calculateRepoHealthDetails(repo);
  return Repository.findOneAndUpdate(
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
      url: repo.html_url,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );
};

// Converts raw GitHub events into { date: "YYYY-MM-DD", count: N }[] for the last 365 days
const buildActivityHeatmap = (events = []) => {
  const counts = {};

  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    counts[d.toISOString().slice(0, 10)] = 0;
  }

  events.forEach((event) => {
    if (!event.created_at) return;
    const key = new Date(event.created_at).toISOString().slice(0, 10);
    if (key in counts) counts[key] += 1;
  });

  return Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const getTopKey = (counts) => {
  const entries = Object.entries(counts);
  if (!entries.length) return null;
  return Number(entries.sort((a, b) => b[1] - a[1])[0][0]);
};

module.exports = {
  GITHUB_API,
  buildActivityHeatmap,
  buildSkillProfile,
  fetchRecentEvents,
  fetchUserRepos,
  githubGet,
  githubHeaders,
  syncUserProfile,
  upsertRepositoryFromGithub,
};
