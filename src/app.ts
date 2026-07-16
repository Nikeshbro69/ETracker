import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { requestLogger } from "./middleware/requestLogger.js";
import { globalRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { envConfig } from "./config/env.config.js";

// Route imports
import authRoutes from "./modules/auth/auth.routes.js";
import incomeRoutes from "./modules/income/income.routes.js";
import expenseRoutes from "./modules/expense/expense.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import reportRoutes from "./modules/report/report.routes.js";
import noteRoutes from "./modules/note/note.routes.js";
import reminderRoutes from "./modules/reminder/reminder.routes.js";
import attachmentRoutes from "./modules/attachment/attachment.routes.js";

const app: Express = express();

// ── Security & parsing middleware ────────────────────────────────────────────
app.use(
  cors({
    origin: envConfig.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(globalRateLimiter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "FMS API is running", timestamp: new Date().toISOString() });
});

// ── API v1 routes ─────────────────────────────────────────────────────────────
const API = "/api/v1";

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/income`, incomeRoutes);
app.use(`${API}/expense`, expenseRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/dashboard`, dashboardRoutes);
app.use(`${API}/reports`, reportRoutes);
app.use(`${API}/notes`, noteRoutes);
app.use(`${API}/reminders`, reminderRoutes);
app.use(`${API}/attachments`, attachmentRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
});

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;
