const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

// Patient routes
router.get("/", patientController.getAllPatients);
router.get("/stats", patientController.getPatientStats);
router.get("/search/:query", patientController.searchPatients);
router.get("/:id", patientController.getPatientById);
router.post("/", patientController.createPatient);
router.put("/:id", patientController.updatePatient);
router.delete("/:id", patientController.deletePatient);
router.post("/bulk-delete", patientController.bulkDeletePatients);

module.exports = router;