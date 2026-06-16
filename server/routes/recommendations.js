const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Placeholder — we'll build this out in Week 3
router.get("/", authMiddleware, (req, res) => {
  res.json({ message: "Recommendations coming soon", recommendations: [] });
});

module.exports = router;