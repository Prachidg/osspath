const mongoose = require("mongoose");

const RepositorySchema = new mongoose.Schema({
  repoId: { type: String, required: true, unique: true },
  name: { type: String },
  fullName: { type: String },
  description: { type: String },
  language: { type: String },
  stars: { type: Number, default: 0 },
  topics: { type: [String], default: [] },
  healthScore: { type: Number, default: 0 },
  url: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Repository", RepositorySchema);