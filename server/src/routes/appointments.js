const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Public route - create appointment (no auth required)
router.post("/", appointmentController.createAppointment);

// Admin routes - require authentication
router.get("/", appointmentController.getAdminAppointments);
router.get("/today", appointmentController.getTodaysAppointments);
router.get("/upcoming", appointmentController.getUpcomingAppointments);
router.get("/stats", appointmentController.getAppointmentStats);
router.get("/patient/:patientId", appointmentController.getPatientAppointments);
router.get(
  "/patient/:patientId/filtered",
  appointmentController.getFilteredAppointments
);
router.put("/:id", appointmentController.updateAppointment);
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;