require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("../src/models/Event");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/eventhub");
  const examples = [
    {
      title: "Linux Administration Hands-on Workshop",
      description: "A practical session covering users, permissions, services, and troubleshooting on Linux.",
      category: "Workshop", venue: "Computer Lab 2",
      startsAt: new Date(Date.now() + 7 * 86400000),
      endsAt: new Date(Date.now() + 7 * 86400000 + 2 * 3600000),
      capacity: 40, organizer: "Computer Science Department", status: "published"
    },
    {
      title: "Cyber Safety Awareness Seminar",
      description: "Learn how to recognise phishing, protect accounts, and report suspicious online activity.",
      category: "Seminar", venue: "Main Auditorium",
      startsAt: new Date(Date.now() + 10 * 86400000),
      endsAt: new Date(Date.now() + 10 * 86400000 + 90 * 60000),
      capacity: 150, organizer: "Cyber Security Club", status: "published"
    },
    {
      title: "Student Project Showcase",
      description: "Teams demonstrate software, data, and security projects and share lessons learned.",
      category: "Competition", venue: "Innovation Centre",
      startsAt: new Date(Date.now() + 14 * 86400000),
      endsAt: new Date(Date.now() + 14 * 86400000 + 4 * 3600000),
      capacity: 60, organizer: "Innovation Cell", status: "published"
    }
  ];
  for (const event of examples) {
    await Event.updateOne({ title: event.title }, { $setOnInsert: event }, { upsert: true });
  }
  console.log("Seed data ready.");
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
