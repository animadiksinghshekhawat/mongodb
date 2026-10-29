const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Feedback = require("../models/Feedback");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/", asyncHandler(async (req, res) => {
  const { event, participantName, rating, comment } = req.body;
  if (!mongoose.Types.ObjectId.isValid(event || "")) {
    return res.status(400).json({ error: "A valid event ID is required." });
  }
  if (!(await Event.exists({ _id: event }))) {
    return res.status(404).json({ error: "Event not found." });
  }
  const feedback = await Feedback.create({ event, participantName, rating, comment });
  res.status(201).json({ data: feedback });
}));

router.get("/", asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.event) filter.event = req.query.event;
  if (req.query.minRating) filter.rating = { $gte: Number(req.query.minRating) };
  const data = await Feedback.find(filter).populate("event", "title").sort({ createdAt: -1 }).limit(200).lean();
  res.json({ data, count: data.length });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid feedback ID" });
  }
  const item = await Feedback.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: "Feedback not found" });
  res.json({ message: "Feedback deleted." });
}));

module.exports = router;
