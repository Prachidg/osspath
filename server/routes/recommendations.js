const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  generateRecommendations,
  getRecommendations,
  recordInteraction,
} = require("../services/recommendationService");
const User = require("../models/User");
const Repository = require("../models/Repository");

router.get("/", authMiddleware, async (req, res) => {
  try {
    let recommendations = await getRecommendations(req.user._id);

    if (!recommendations.length) {
      recommendations = await generateRecommendations(req.user._id);
    }

    const user = await User.findById(req.user._id).select("readinessScore");
    res.json({ recommendations, readinessScore: user?.readinessScore || 0 });
  } catch (err) {
    console.error("Recommendation fetch error:", err.message, err.stack);
    res.status(500).json({ error: "Failed to load recommendations" });
  }
});

router.get("/repos", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("skillProfile");
    const languageCount = user?.skillProfile?.languageCount || {};
    const topics = user?.skillProfile?.topics || [];
    const skills = [...Object.keys(languageCount), ...topics].map((s) => s.toLowerCase());

    const query = skills.length
      ? { $or: [{ language: { $in: Object.keys(languageCount) } }, { topics: { $in: topics } }] }
      : {};

    const candidates = await Repository.find(query).limit(200).lean();
    const pool = candidates.length ? candidates : await Repository.find().sort({ healthScore: -1 }).limit(200).lean();

    const scored = pool.map((repo) => {
      const repoTags = [repo.language, ...(repo.topics || [])].filter(Boolean).map((t) => t.toLowerCase());
      const overlap = repoTags.filter((tag) => skills.includes(tag)).length;
      const skillOverlapScore = overlap * 10;
      const healthScore = repo.healthScore || 0;
      return { repo, score: healthScore + skillOverlapScore };
    });

    const topRepos = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(({ repo }) => ({
        id: repo._id,
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        stars: repo.stars,
        language: repo.language,
        topics: repo.topics,
        healthScore: repo.healthScore,
        url: repo.url,
      }));

    res.json({ repos: topRepos });
  } catch (err) {
    console.error("Repo recommendation error:", err.message);
    res.status(500).json({ error: "Failed to fetch recommended repositories" });
  }
});

router.post("/refresh", authMiddleware, async (req, res) => {
  try {
    const recommendations = await generateRecommendations(req.user._id);
    const user = await User.findById(req.user._id).select("readinessScore");
    res.json({ recommendations, readinessScore: user?.readinessScore || 0 });
  } catch (err) {
    console.error("Recommendation refresh error:", err.message);
    res.status(500).json({ error: "Failed to refresh recommendations" });
  }
});

router.post("/interactions", authMiddleware, async (req, res) => {
  try {
    const { issueId, status, timeSpent, notes } = req.body;

    if (!issueId || !["attempted", "completed", "abandoned"].includes(status)) {
      return res.status(400).json({ error: "Valid issueId and status are required" });
    }

    const interaction = await recordInteraction({
      userId: req.user._id,
      issueId,
      status,
      timeSpent,
      notes,
    });

    res.status(201).json({ interaction });
  } catch (err) {
    console.error("Interaction record error:", err.message);
    res.status(500).json({ error: "Failed to record interaction" });
  }
});

module.exports = router;