const express = require("express");
const router = express.Router();
const systemController = require("../controllers/systemController");

// Public route
router.get("/health", systemController.healthCheck);

// Admin routes - require authentication
router.get("/info", systemController.getSystemInfo);

module.exports = router;