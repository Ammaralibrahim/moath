const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authMiddleware = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");

// Route importları
const patientRoutes = require("./routes/patients");
const appointmentRoutes = require("./routes/appointments");
const systemRoutes = require("./routes/system");
const availabilityRoutes = require("./routes/availability");
const backupRoutes = require("./routes/backup");
const reportRoutes = require("./routes/reports");

const app = express();

// Basit CORS yapılandırması - sadece https://alsawaf.vercel.app izin verilir
app.use(
  cors({
    origin: "https://alsawaf.vercel.app",
    credentials: true, // çerez / authorization header'ları için
  })
);

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Route'lar
app.use("/api/patients", authMiddleware, patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin/appointments", authMiddleware, appointmentRoutes);
app.use("/api/backup", authMiddleware, backupRoutes);
app.use("/api/reports", authMiddleware, reportRoutes);
app.use("/api/system", authMiddleware, systemRoutes);
app.use("/api/health", systemRoutes);
app.use("/api/availability", availabilityRoutes);

// Hata yönetimi middleware'i
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint غير موجود",
  });
});

module.exports = app;