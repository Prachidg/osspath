const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
  issueId: { type: String, required: true, unique: true },
  title: { type: String },
  body: { type: String },
  labels: { type: [String], default: [] },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  freshnessScore: { type: Number, default: 100 },
  successRate: { type: Number, default: 0 },
  state: { type: String, enum: ["open", "closed"], default: "open" },
  assignee: { type: String },
  repoName: { type: String },
  repoUrl: { type: String },
  issueUrl: { type: String },
  language: { type: String },
  repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Repository" },
  embeddingVectorId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  lastSyncedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Issue", IssueSchema);
