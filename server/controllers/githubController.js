const { syncUserProfile, fetchRecentEvents, buildActivityHeatmap } = require("../services/githubService");
const { decrypt } = require("../utils/crypto");

const githubController = {
  fetchAndStoreRepos: async (req, res) => {
    try {
      const result = await syncUserProfile(req.user);
      res.json({
        skills: result.skills,
        skillProfile: result.skillProfile,
        readinessScore: result.readinessScore,
        repoCount: result.repos.length,
      });
    } catch (err) {
      console.error("GitHub fetch error:", err.message);
      res.status(500).json({ error: "Failed to fetch GitHub data" });
    }
  },

  getActivity: async (req, res) => {
    try {
      const token = decrypt(req.user.accessToken);
      const events = await fetchRecentEvents(req.user.username, token);
      const heatmapData = buildActivityHeatmap(events);
      res.json(heatmapData);
    } catch (err) {
      console.error("GitHub activity fetch error:", err.message);
      res.status(500).json({ error: "Failed to fetch activity data" });
    }
  },
};

module.exports = githubController;