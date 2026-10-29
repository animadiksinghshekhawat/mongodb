const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/", asyncHandler(async (req, res) => {
  const { event, participantName, email, phone } = req.body;
  if (!mongoose.Types.ObjectId.isValid(event || "")) {
    return res.status(400).json({ error: "A valid event ID is required." });
  }
  const targetEvent = await Event.findById(event);
  if (!targetEvent || targetEvent.status !== "published") {
    return res.status(404).json({ error: "Published event not found." });
  }
  const registeredCount = await Registration.countDocuments({ event, status: "registered" });
  if (registeredCount >= targetEvent.capacity) {
    return res.status(409).json({ error: "This event has reached its capacity." });
  }
  const registration = await Registration.create({ event, participantName, email, phone });
  res.status(201).json({ data: registration });
}));

router.get("/", asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.event) filter.event = req.query.event;
  if (req.query.email) filter.email = String(req.query.email).toLowerCase();
  if (req.query.status) filter.status = req.query.status;
  const data = await Registration.find(filter)
    .populate("event", "title startsAt venue")
    .sort({ createdAt: -1 }).limit(200).lean();
  res.json({ data, count: data.length });
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid registration ID" });
  }
  const allowed = {};
  if (req.body.status) allowed.status = req.body.status;
  if (req.body.participantName) allowed.participantName = req.body.participantName;
  if (req.body.phone !== undefined) allowed.phone = req.body.phone;
  const item = await Registration.findByIdAndUpdate(req.params.id, allowed, {
    new: true, runValidators: true
  });
  if (!item) return res.status(404).json({ error: "Registration not found" });
  res.json({ data: item });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid registration ID" });
  }
  const item = await Registration.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: "Registration not found" });
  res.json({ message: "Registration cancelled and removed." });
}));

module.exports = router;
