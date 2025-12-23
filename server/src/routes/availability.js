// routes/availability.js
const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/availabilityController");

// Public routes - no authentication required
router.get("/available-dates", availabilityController.getAvailableDates);
router.get("/available-slots", availabilityController.getAvailableSlots);
router.get("/check-slot", availabilityController.checkSlotAvailability);

module.exports = router;