const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/github", passport.authenticate("github", { scope: ["user", "repo"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

router.get("/me", authMiddleware, authController.getMe);
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;