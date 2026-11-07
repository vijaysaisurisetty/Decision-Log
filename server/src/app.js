import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import decisionRoutes from "./routes/decisionRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import AppError from "./utils/AppError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

const app = express();

// Trust proxy for reverse proxies / deployment platforms like Render
app.set("trust proxy", 1);

// Security headers (disable strict CSP so React assets and Google Fonts load properly)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: clientOrigin,
    credentials: true
  })
);

// Body parsing with 100kb limit
app.use(express.json({ limit: "100kb" }));

// HTTP logging in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check endpoint (mounted before rate limiter so health checks are never throttled)
app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const uptime = Math.floor(process.uptime());
  const timestamp = new Date().toISOString();

  if (isConnected) {
    return res.status(200).json({
      status: "ok",
      database: "connected",
      uptime,
      timestamp
    });
  }

  return res.status(503).json({
    status: "degraded",
    database: "disconnected",
    uptime,
    timestamp
  });
});

// Rate limiting on /api for resource endpoints
const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || "1000", 10);
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError(429, "Too many requests, please try again later"));
  }
});
app.use("/api", apiLimiter);

// Resource routes
app.use("/api/decisions", decisionRoutes);
app.use("/api/tasks", taskRoutes);

// Serve compiled client static files in production / when build folder exists
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for all GET routes (ignoring /api)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// 404 and Error handling for unhandled routes
app.use(notFound);
app.use(errorHandler);

export default app;
