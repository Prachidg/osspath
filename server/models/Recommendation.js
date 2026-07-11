const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
  repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Repository" },
  matchScore: { type: Number, required: true },
  matchReason: { type: String, required: true },
  signals: { type: Object, default: {} },
  generatedAt: { type: Date, default: Date.now },
});

RecommendationSchema.index({ userId: 1, matchScore: -1, generatedAt: -1 });

module.exports = mongoose.model("Recommendation", RecommendationSchema);
