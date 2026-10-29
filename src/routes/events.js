const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/events?category=Workshop&status=published&page=1&limit=10&search=linux
router.get("/", asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.from || req.query.to) {
    filter.startsAt = {};
    if (req.query.from) filter.startsAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.startsAt.$lte = new Date(req.query.to);
  }
  if (req.query.search) filter.$text = { $search: String(req.query.search) };

  const [events, total] = await Promise.all([
    Event.find(filter).sort({ startsAt: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Event.countDocuments(filter)
  ]);
  res.json({ data: events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.post("/", asyncHandler(async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json({ data: event });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid event ID" });
  const event = await Event.findById(req.params.id).lean();
  if (!event) return res.status(404).json({ error: "Event not found" });
  const registrations = await Registration.countDocuments({ event: event._id, status: "registered" });
  res.json({ data: { ...event, registeredCount: registrations } });
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid event ID" });
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  });
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json({ data: event });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid event ID" });
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  await Promise.all([
    Registration.deleteMany({ event: event._id }),
    require("../models/Feedback").deleteMany({ event: event._id })
  ]);
  res.json({ message: "Event and related registrations/feedback deleted." });
}));

router.get("/:id/summary", asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid event ID" });
  const event = await Event.findById(req.params.id).lean();
  if (!event) return res.status(404).json({ error: "Event not found" });
  const [registrations, feedback] = await Promise.all([
    Registration.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(req.params.id), status: "registered" } },
      { $count: "count" }
    ]),
    require("../models/Feedback").aggregate([
      { $match: { event: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: { _id: "$event", averageRating: { $avg: "$rating" }, feedbackCount: { $sum: 1 } } }
    ])
  ]);
  res.json({
    data: {
      event,
      registeredCount: registrations[0]?.count || 0,
      averageRating: feedback[0] ? Number(feedback[0].averageRating.toFixed(2)) : null,
      feedbackCount: feedback[0]?.feedbackCount || 0
    }
  });
}));

module.exports = router;
