require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Redis = require('ioredis');
const RedisStore = require('connect-redis').default;
const { MongoStore } = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const { encrypt } = require('./utils/crypto');

// Route imports
const authRoutes = require("./routes/auth");
const githubRoutes = require("./routes/github");
const recommendationRoutes = require("./routes/recommendations");

// Passport config
const User = require("./models/User");
const { syncUserProfile } = require("./services/githubService");
const GitHubStrategy = require("passport-github2").Strategy;

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:5001'}/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });
        let isNewUser = false;

        if (!user) {
          user = await User.create({
            githubId: profile.id,
            username: profile.username,
            avatar: profile.photos?.[0]?.value,
            email: profile.emails?.[0]?.value,
            profileUrl: profile.profileUrl,
            accessToken: encrypt(accessToken),
          });
          isNewUser = true;
        } else {
          user.accessToken = encrypt(accessToken);
          await user.save();
        }

        // Fire-and-forget sync so the profile/dashboard have data ready
        // without blocking the OAuth redirect.
        if (isNewUser) {
          syncUserProfile(user).catch((err) =>
            console.error("Background sync failed for new user:", err.message)
          );
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

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Resolves a session store: Redis if reachable, otherwise MongoDB
// (via connect-mongo) so sessions survive server restarts without Redis.
const buildSessionStore = async () => {
  try {
    const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return Math.min(times * 200, 1000);
      },
    });
    redisClient.on('error', () => {}); // Suppress unhandled error events

    await redisClient.connect();
    console.log('✓ Redis connected — using Redis session store');
    return new RedisStore({ client: redisClient });
  } catch {
    console.warn('⚠ Redis unavailable — falling back to MongoDB session store');
    return MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 7 * 24 * 60 * 60, // 7 days, matches cookie maxAge below
    });
  }
};

// Rate limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const start = async () => {
  // Connect DB
  await connectDB();

  const sessionStore = await buildSessionStore();

  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' },
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Routes
  app.use("/auth", authLimiter, authRoutes);
  app.use("/github", apiLimiter, githubRoutes);
  app.use("/recommendations", apiLimiter, recommendationRoutes);

  app.get("/", (req, res) => res.send("OSSPath Backend Running"));

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
  });

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();