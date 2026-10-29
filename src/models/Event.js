const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: {
    type: String,
    required: true,
    enum: ["Workshop", "Seminar", "Competition", "Cultural", "Sports", "Other"],
    index: true
  },
  venue: { type: String, required: true, trim: true, maxlength: 160 },
  startsAt: { type: Date, required: true, index: true },
  endsAt: { type: Date, required: true },
  capacity: { type: Number, required: true, min: 1, max: 100000 },
  organizer: { type: String, required: true, trim: true, maxlength: 120 },
  status: {
    type: String,
    enum: ["draft", "published", "cancelled", "completed"],
    default: "published",
    index: true
  }
}, { timestamps: true });

eventSchema.pre("validate", function validateDates(next) {
  if (this.startsAt && this.endsAt && this.endsAt <= this.startsAt) {
    this.invalidate("endsAt", "Event end time must be after start time.");
  }
  next();
});

eventSchema.index({ status: 1, startsAt: 1 });
eventSchema.index({ category: 1, startsAt: 1 });
eventSchema.index({ title: "text", description: "text", venue: "text" });

module.exports = mongoose.model("Event", eventSchema);
