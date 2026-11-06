import mongoose from "mongoose";
import dns from "dns";

let isReconnecting = false;
let listenersAttached = false;

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/decisionlog";

  // If user provided an Atlas URI without a database name (e.g. ending with /), append 'decisionlog'
  if (uri.startsWith("mongodb+srv://") && uri.endsWith("/")) {
    uri = `${uri}decisionlog?retryWrites=true&w=majority`;
  }

  // Pre-configure DNS servers for Atlas SRV queries to prevent Windows ECONNREFUSED issues
  if (uri.startsWith("mongodb+srv://")) {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch {
      // Ignore if setServers is restricted
    }
  }

  if (!listenersAttached) {
    listenersAttached = true;
    mongoose.connection.on("disconnected", async () => {
      console.warn("[Database] MongoDB disconnected. Attempting auto-reconnect...");
      if (isReconnecting) return;
      isReconnecting = true;
      try {
        await new Promise((r) => setTimeout(r, 1000));
        await mongoose.connect(uri);
        console.log("[Database] Reconnected successfully to MongoDB!");
      } catch (err) {
        console.error("[Database] Auto-reconnect failed:", err.message);
      } finally {
        isReconnecting = false;
      }
    });
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      if (error.message && error.message.includes("querySrv")) {
        try {
          dns.setServers(["8.8.8.8", "1.1.1.1"]);
          const conn = await mongoose.connect(uri);
          console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
          return conn;
        } catch {
          // continue to retry logic below
        }
      }
      if (attempt === maxRetries) {
        console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
        process.exit(1);
      }
      console.warn(`[Database] Connection attempt ${attempt} failed (${error.message}). Retrying in 1s...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
};

export default connectDB;
