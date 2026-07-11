const BEGINNER_LABELS = ["good first issue", "first-timers-only", "beginner", "easy", "help wanted"];
const INTERMEDIATE_LABELS = ["enhancement", "feature", "refactor", "documentation"];
const ADVANCED_LABELS = ["performance", "architecture", "security", "breaking change"];

const normalize = (value = "") => value.toLowerCase().trim();

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const inferDifficulty = (labels = [], title = "", body = "") => {
  const haystack = [...labels, title, body].map(normalize).join(" ");

  if (ADVANCED_LABELS.some((label) => haystack.includes(label))) {
    return "advanced";
  }

  if (BEGINNER_LABELS.some((label) => haystack.includes(label))) {
    return "beginner";
  }

  if (INTERMEDIATE_LABELS.some((label) => haystack.includes(label))) {
    return "intermediate";
  }

  return body && body.length > 1800 ? "advanced" : "intermediate";
};

const calculateFreshnessScore = (createdAt, updatedAt = createdAt) => {
  const lastActivity = new Date(updatedAt || createdAt).getTime();
  const ageHours = (Date.now() - lastActivity) / (1000 * 60 * 60);
  return Math.round(clamp(100 - ageHours * 1.8, 20, 100));
};

const calculateRepoHealthScore = (repo) => {
  const stars = Math.min(repo.stargazers_count || repo.stars || 0, 50000);
  const openIssues = repo.open_issues_count || repo.openIssues || 0;
  const pushedAt = repo.pushed_at || repo.lastPushedAt;
  const daysSincePush = pushedAt
    ? (Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24)
    : 365;

  const activityScore = clamp(100 - daysSincePush * 2.5);
  const popularityScore = clamp(Math.log10(stars + 1) * 20);
  const issueScore = openIssues > 0 ? 75 : 35;
  const docsScore = repo.description ? 70 : 35;

  return Math.round(activityScore * 0.35 + popularityScore * 0.25 + issueScore * 0.2 + docsScore * 0.2);
};

const calculateRepoHealthDetails = (repo) => {
  const score = calculateRepoHealthScore(repo);
  const pushedAt = repo.pushed_at || repo.lastPushedAt;
  const daysSincePush = pushedAt
    ? Math.round((Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    score,
    details: {
      daysSincePush,
      hasDescription: Boolean(repo.description),
      openIssues: repo.open_issues_count || repo.openIssues || 0,
      stars: repo.stargazers_count || repo.stars || 0,
      topics: repo.topics || [],
    },
  };
};

const calculateReadinessScore = (skillProfile = {}) => {
  const languageCount = skillProfile.languageCount || {};
  const topics = skillProfile.topics || [];
  const repoCount = Object.values(languageCount).reduce((sum, count) => sum + count, 0);
  const languageBreadth = Object.keys(languageCount).length;

  return Math.round(clamp(repoCount * 6 + languageBreadth * 8 + topics.length * 2, 15, 92));
};

const getSkillTerms = (user) => {
  const profile = user.skillProfile || {};
  return [
    ...(user.skills || []),
    ...Object.keys(profile.languageCount || {}),
    ...(profile.topics || []),
  ]
    .map(normalize)
    .filter(Boolean);
};

const calculateMatch = ({ user, issue, repository, semanticScore = 0 }) => {
  const skillTerms = getSkillTerms(user);
  const issueText = normalize(
    `${issue.title || ""} ${issue.body || ""} ${(issue.labels || []).join(" ")} ${issue.language || ""} ${issue.repoName || ""}`
  );

  const matchedSkills = [...new Set(skillTerms.filter((term) => issueText.includes(term)))].slice(0, 5);
  const skillScore = Math.min(matchedSkills.length * 14, 42);
  const languageScore = issue.language && skillTerms.includes(normalize(issue.language)) ? 18 : 0;
  const difficultyScore = getDifficultyFitScore(user.readinessScore || 0, issue.difficulty);
  const freshnessScore = Math.round((issue.freshnessScore || 60) * 0.16);
  const healthScore = Math.round((repository?.healthScore || 55) * 0.14);
  const semanticBoost = Math.round(clamp(semanticScore * 100, 0, 100) * 0.22);

  const matchScore = Math.round(clamp(16 + skillScore + languageScore + difficultyScore + freshnessScore + healthScore + semanticBoost));

  return {
    matchScore,
    matchedSkills,
    signals: {
      matchedSkills,
      language: issue.language,
      difficulty: issue.difficulty,
      freshnessScore: issue.freshnessScore,
      healthScore: repository?.healthScore,
      semanticScore: Math.round(semanticScore * 100) / 100,
    },
  };
};

const getDifficultyFitScore = (readinessScore, difficulty) => {
  if (difficulty === "beginner") return readinessScore < 65 ? 18 : 10;
  if (difficulty === "intermediate") return readinessScore >= 45 && readinessScore <= 82 ? 18 : 9;
  return readinessScore >= 70 ? 17 : 4;
};

const buildMatchReason = ({ issue, repository, matchedSkills }) => {
  const skillsText = matchedSkills.length
    ? `your profile overlaps on ${matchedSkills.join(", ")}`
    : "your GitHub activity suggests adjacent skills for this issue";
  const repoText = repository?.healthScore
    ? `the repository has a ${repository.healthScore}/100 health score`
    : "the repository appears active enough to be worth exploring";

  return `Recommended because ${skillsText}, this is a ${issue.difficulty} issue, and ${repoText}.`;
};

module.exports = {
  calculateFreshnessScore,
  calculateMatch,
  calculateReadinessScore,
  calculateRepoHealthDetails,
  calculateRepoHealthScore,
  buildMatchReason,
  inferDifficulty,
};
