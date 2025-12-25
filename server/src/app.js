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
const availabilityRoutes = require("./routes/availability");
const backupRoutes = require("./routes/backup");
const reportRoutes = require("./routes/reports");

const app = express();

// GÜNCELLENMİŞ CORS yapılandırması
const allowedOrigins = [
  'https://alsawaf.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173', // Vite geliştirme sunucusu için
  'https://alsawaf.vercel.app/',
  'https://www.alsawaf.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Postman gibi araçlardan gelen isteklere izin ver
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-admin-key', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Authorization',
    'x-admin-key'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Özel OPTIONS handler
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

// Preflight istekleri için özel middleware
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(204).end();
  }
  next();
});

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware (debug için)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

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