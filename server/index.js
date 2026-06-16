require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/auth");
const githubRoutes = require("./routes/github");
const recommendationRoutes = require("./routes/recommendations");

// Passport config
const User = require("./models/User");
const GitHubStrategy = require("passport-github2").Strategy;

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5001/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
          user = await User.create({
            githubId: profile.id,
            username: profile.username,
            avatar: profile.photos?.[0]?.value,
            email: profile.emails?.[0]?.value,
            profileUrl: profile.profileUrl,
            accessToken,
          });
        } else {
          user.accessToken = accessToken;
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/github", githubRoutes);
app.use("/recommendations", recommendationRoutes);

app.get("/", (req, res) => res.send("OSSPath Backend Running"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));