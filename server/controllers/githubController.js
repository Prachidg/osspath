const axios = require("axios");
const User = require("../models/User");

const githubController = {
  fetchAndStoreRepos: async (req, res) => {
    try {
      const accessToken = req.user.accessToken;

      const reposRes = await axios.get("https://api.github.com/user/repos", {
        headers: { Authorization: `token ${accessToken}` },
        params: { per_page: 100, sort: "updated" },
      });

      const repos = reposRes.data;

      // Extract skills from repos
      const languageCount = {};
      const topicsSet = new Set();

      repos.forEach((repo) => {
        if (repo.language) {
          languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        }
        if (repo.topics) {
          repo.topics.forEach((t) => topicsSet.add(t));
        }
      });

      const skills = [
        ...Object.keys(languageCount),
        ...Array.from(topicsSet),
      ];

      // Update user skills
      await User.findByIdAndUpdate(req.user._id, {
        skills,
        skillProfile: { languageCount, topics: Array.from(topicsSet) },
      });

      res.json({ repos, skills, skillProfile: { languageCount, topics: Array.from(topicsSet) } });
    } catch (err) {
      console.error("GitHub fetch error:", err.message);
      res.status(500).json({ error: "Failed to fetch GitHub data" });
    }
  },
};

module.exports = githubController;