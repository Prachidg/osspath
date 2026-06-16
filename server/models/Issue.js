const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
  issueId: { type: String, required: true, unique: true },
  title: { type: String },
  body: { type: String },
  labels: { type: [String], default: [] },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  repoName: { type: String },
  repoUrl: { type: String },
  issueUrl: { type: String },
  language: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Issue", IssueSchema);