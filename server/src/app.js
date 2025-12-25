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

// 1. ÖNCE tüm OPTIONS isteklerini handle et
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://alsawaf.vercel.app',

  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key, X-Requested-With, Accept');
  res.header('Access-Control-Max-Age', '86400'); // 24 saat
  res.status(204).end();
});

// 2. CORS middleware - çok basit ve etkili
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://alsawaf.vercel.app',

  ];
  
  // Origin kontrolü
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key, X-Requested-With, Accept');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, x-admin-key');
  
  // Preflight isteklerini handle et
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 3. Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// 4. Logging middleware (debug için)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'} - Headers:`, {
    'x-admin-key': req.headers['x-admin-key'] ? 'present' : 'missing',
    'content-type': req.headers['content-type'],
    'authorization': req.headers['authorization'] ? 'present' : 'missing'
  });
  next();
});

// 5. Public routes (auth olmadan)
app.use("/api/availability", availabilityRoutes);
app.use("/api/health", systemRoutes);
app.use("/api/appointments", appointmentRoutes); // Public appointment routes

// 6. Protected routes (auth ile)
app.use("/api/patients", authMiddleware, patientRoutes);
app.use("/api/admin/appointments", authMiddleware, appointmentRoutes);
app.use("/api/backup", authMiddleware, backupRoutes);
app.use("/api/reports", authMiddleware, reportRoutes);
app.use("/api/system", authMiddleware, systemRoutes);

// 7. Hata yönetimi middleware'i
app.use(errorHandler);

// 8. 404 handler
app.use("*", (req, res) => {
  console.log(`404: ${req.method} ${req.originalUrl} from ${req.headers.origin}`);
  res.status(404).json({
    success: false,
    message: "Endpoint غير موجود",
    path: req.originalUrl
  });
});

module.exports = app;