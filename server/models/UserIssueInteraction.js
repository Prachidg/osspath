const mongoose = require("mongoose");

const UserIssueInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
  status: {
    type: String,
    enum: ["attempted", "completed", "abandoned"],
    required: true,
  },
  timeSpent: { type: Number, default: 0 },
  notes: { type: String },
  timestamp: { type: Date, default: Date.now },
});

UserIssueInteractionSchema.index({ userId: 1, issueId: 1, timestamp: -1 });

module.exports = mongoose.model("UserIssueInteraction", UserIssueInteractionSchema);
