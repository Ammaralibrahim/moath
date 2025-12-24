// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Rapor route'ları
router.get("/appointments/excel", reportController.exportAppointmentsExcel);
router.get("/patients/excel", reportController.exportPatientsExcel);
router.get("/performance/monthly", reportController.monthlyPerformanceReport);
router.get("/patients/analysis", reportController.patientAnalysisReport);
router.get("/appointments/upcoming", reportController.upcomingAppointmentsReport);
router.get("/daily/pdf", reportController.dailyReportPDF);
router.get("/stats", reportController.systemStats);

// Eski route'lar (geriye dönük uyumluluk için)
router.get("/appointments/export", reportController.exportAppointmentsExcel);
router.get("/patients/export", reportController.exportPatientsExcel);
router.get("/daily", reportController.dailyReportPDF);

module.exports = router;