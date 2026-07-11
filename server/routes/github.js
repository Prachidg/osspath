const express = require("express");
const router = express.Router();
const githubController = require("../controllers/githubController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/repos", authMiddleware, githubController.fetchAndStoreRepos);
router.get("/activity", authMiddleware, githubController.getActivity);

module.exports = router;