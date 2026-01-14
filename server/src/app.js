const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authMiddleware = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");

// Routes
const patientRoutes = require("./routes/patients");
const appointmentRoutes = require("./routes/appointments");
const systemRoutes = require("./routes/system");
const availabilityRoutes = require("./routes/availability");
const backupRoutes = require("./routes/backup");
const reportRoutes = require("./routes/reports");

const app = express();

/**
 * =========================
 * CORS (TEK KAYNAK – SADE)
 * =========================
 */
const allowedOrigins = [
  "https://alsawaf.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman, curl, server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS BLOCKED"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
  })
);

/**
 * =========================
 * BODY PARSER
 * =========================
 */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * =========================
 * ROUTES
 * =========================
 */

// PUBLIC
app.use("/api/health", systemRoutes);
app.use("/api/availability", availabilityRoutes);

// PROTECTED
app.use("/api/patients", authMiddleware, patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin/appointments", authMiddleware, appointmentRoutes);
app.use("/api/system", authMiddleware, systemRoutes);
app.use("/api/backup", authMiddleware, backupRoutes);
app.use("/api/reports", authMiddleware, reportRoutes);

/**
 * =========================
 * ERROR HANDLING
 * =========================
 */
app.use(errorHandler);

/**
 * =========================
 * 404
 * =========================
 */
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint غير موجود",
  });
});

module.exports = app;
