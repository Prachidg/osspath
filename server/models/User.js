const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatar: { type: String },
  email: { type: String },
  profileUrl: { type: String },
  skills: { type: [String], default: [] },
  skillProfile: { type: Object, default: {} },
  readinessScore: { type: Number, default: 0 },
  difficultyProfile: { type: Object, default: {} },
  accessToken: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);