const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Public route - create appointment (no auth required)
router.post("/", appointmentController.createAppointment);

// Admin routes - require authentication
router.get("/", appointmentController.getAdminAppointments);
router.put("/:id", appointmentController.updateAppointment);
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;