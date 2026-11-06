import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`[Server] DecisionLog server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`[Server Error] Port ${PORT} is already in use.`);
      process.exit(1);
    } else {
      console.error("[Server Error]", err);
    }
  });
};

const gracefulShutdown = (signal, callback) => {
  console.log(`[Server] ${signal} signal received: closing HTTP server and database connections`);
  if (server) {
    server.close(async () => {
      console.log("[Server] HTTP server closed");
      try {
        await mongoose.connection.close(false);
        console.log("[Database] Mongoose connection disconnected");
        if (callback) callback();
        else process.exit(0);
      } catch (err) {
        console.error("[Database] Error closing mongoose connection:", err);
        if (callback) callback();
        else process.exit(1);
      }
    });
  } else {
    if (callback) callback();
    else process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.once("SIGUSR2", () => {
  gracefulShutdown("SIGUSR2", () => {
    process.kill(process.pid, "SIGUSR2");
  });
});

process.on("unhandledRejection", (err) => {
  console.error("[Fatal] Unhandled Rejection:", err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("[Fatal] Uncaught Exception:", err);
  process.exit(1);
});

startServer();
