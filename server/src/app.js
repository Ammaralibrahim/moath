const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authMiddleware = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");

// Route importları
const patientRoutes = require("./routes/patients");
const appointmentRoutes = require("./routes/appointments");
const backupRoutes = require("./routes/backup");
const systemRoutes = require("./routes/system");
const availabilityRoutes = require("./routes/availability"); // EKSİK OLAN ROUTE

const app = express();

// CORS yapılandırması
app.use(cors({
  origin: ['https://alsawaf.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key', 'X-Requested-With']
}));

// OPTIONS isteklerini handle et
app.options('*', cors());

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Route'lar
app.use("/api/patients", authMiddleware, patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin/appointments", authMiddleware, appointmentRoutes);
app.use("/api/backup", authMiddleware, backupRoutes);
app.use("/api/system", authMiddleware, systemRoutes);
app.use("/api/health", systemRoutes);
app.use("/api/availability", availabilityRoutes); // EKSİK OLAN ROUTE'U EKLE

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