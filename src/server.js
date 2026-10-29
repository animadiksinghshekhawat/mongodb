require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/eventhub";

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
    const server = app.listen(PORT, () => {
      console.log(`EventHub API listening on http://localhost:${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Closing server...`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Could not start the API:", error.message);
    process.exit(1);
  }
}

if (require.main === module) start();
