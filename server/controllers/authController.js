const authController = {
  getMe: (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({
      id: req.user._id,
      username: req.user.username,
      avatar_url: req.user.avatar,
      avatarUrl: req.user.avatar,
      skills: req.user.skills,
      readinessScore: req.user.readinessScore,
      githubStats: req.user.githubStats,
      skillProfile: req.user.skillProfile,
      activityPattern: req.user.activityPattern,
    });
  },

  logout: (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.json({ message: "Logged out successfully" });
    });
  },
};

module.exports = authController;