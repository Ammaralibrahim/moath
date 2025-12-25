// routes/availability.js
const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/availabilityController");
router.use((req, res, next) => {
  const allowedOrigins = [
    'https://alsawaf.vercel.app',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key, X-Requested-With, Accept');
  next();
});

// Public routes - no authentication required
router.get("/available-dates", availabilityController.getAvailableDates);
router.get("/available-slots", availabilityController.getAvailableSlots);
router.get("/check-slot", availabilityController.checkSlotAvailability);

module.exports = router;