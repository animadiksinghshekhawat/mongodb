const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  participantName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 25 },
  status: { type: String, enum: ["registered", "cancelled", "attended"], default: "registered" }
}, { timestamps: true });

registrationSchema.index({ event: 1, email: 1 }, { unique: true });
registrationSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model("Registration", registrationSchema);
