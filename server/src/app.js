const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authMiddleware = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");

// Route importları
const patientRoutes = require("./routes/patients");
const appointmentRoutes = require("./routes/appointments");
const systemRoutes = require("./routes/system");
const availabilityRoutes = require("./routes/availability"); // EKSİK OLAN ROUTE
const backupRoutes = require("./routes/backup");
const reportRoutes = require("./routes/reports");

const allowedOrigins = ['https://alsawaf.vercel.app', 'http://localhost:3000'];


const app = express();

// CORS yapılandırması
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// OPTIONS isteklerini handle et
app.options('*', cors(corsOptions));

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