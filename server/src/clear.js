import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Decision from "./models/Decision.js";
import Task from "./models/Task.js";

export const clearDatabase = async () => {
  try {
    console.log("[Clear] Connecting to database...");
    await connectDB();

    console.log("[Clear] Deleting all decisions and tasks...");
    const decisionResult = await Decision.deleteMany({});
    const taskResult = await Task.deleteMany({});

    console.log(`[Clear] Cleaned successfully! Removed ${decisionResult.deletedCount} decisions and ${taskResult.deletedCount} tasks.`);
    console.log("[Clear] Database is now completely clean and empty.");
    await mongoose.disconnect();
    console.log("[Clear] Database disconnected.");
  } catch (err) {
    console.error("[Clear] Error clearing database:", err);
    process.exit(1);
  }
};

clearDatabase();

