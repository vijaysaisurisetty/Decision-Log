import { MongoMemoryServer } from "mongodb-memory-server";

const start = async () => {
  try {
    console.log("[MongoRunner] Starting MongoMemoryServer on port 27017...");
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: "decisionlog",
        ip: "127.0.0.1"
      }
    });
    console.log("[MongoRunner] MongoMemoryServer running at:", mongod.getUri());
  } catch (err) {
    console.error("[MongoRunner] Failed to start:", err);
    process.exit(1);
  }
};

start();

