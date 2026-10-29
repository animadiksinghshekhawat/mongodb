const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  participantName: { type: String, required: true, trim: true, maxlength: 120 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 1000, default: "" }
}, { timestamps: true });

feedbackSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
