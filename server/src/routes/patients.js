const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const fs = require("fs").promises;
const path = require("path");
const { createObjectCsvStringifier } = require("csv-writer");

// Hasta rotaları
router.get("/", patientController.getAllPatients);
router.get("/stats", patientController.getPatientStats);
router.get("/search/:query", patientController.searchPatients);
router.get("/:id", patientController.getPatientById);
router.post("/", patientController.createPatient);
router.put("/:id", patientController.updatePatient);
router.delete("/:id", patientController.deletePatient);
router.post("/bulk-delete", patientController.bulkDeletePatients);

// Export patients to CSV
router.get("/export", async (req, res) => {
  try {
    const { format = "csv", includeAppointments = "false" } = req.query;
    const patients = await require("../models/Patient").find().select("-__v");

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لا توجد بيانات للتصدير",
      });
    }

    if (format === "json") {
      // Export as JSON
      const patientsWithAge = patients.map((patient) => {
        const patientObj = patient.toObject();
        patientObj.age = patient.age;
        return patientObj;
      });

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="patients-${
          new Date().toISOString().split("T")[0]
        }.json"`
      );
      res.send(JSON.stringify(patientsWithAge, null, 2));
    } else {
      // Export as CSV
      const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: "patientName", title: "اسم المريض" },
          { id: "phoneNumber", title: "رقم الهاتف" },
          { id: "birthDate", title: "تاريخ الميلاد" },
          { id: "age", title: "العمر" },
          { id: "gender", title: "الجنس" },
          { id: "email", title: "البريد الإلكتروني" },
          { id: "address", title: "العنوان" },
          { id: "emergencyContact", title: "جهة اتصال الطوارئ" },
          { id: "appointmentCount", title: "عدد المواعيد" },
          { id: "lastVisit", title: "آخر زيارة" },
          { id: "createdAt", title: "تاريخ التسجيل" },
        ],
      });

      const patientsWithAge = patients.map((patient) => {
        const patientObj = patient.toObject();
        patientObj.age = patient.age;
        patientObj.birthDate = patient.birthDate
          ? new Date(patient.birthDate).toISOString().split("T")[0]
          : "";
        patientObj.lastVisit = patient.lastVisit
          ? new Date(patient.lastVisit).toISOString().split("T")[0]
          : "";
        patientObj.createdAt = new Date(patient.createdAt)
          .toISOString()
          .split("T")[0];
        patientObj.gender = patient.gender === "male" ? "ذكر" : "أنثى";
        return patientObj;
      });

      const csvString =
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(patientsWithAge);
      const csvBuffer = Buffer.from(`\uFEFF${csvString}`, "utf8");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="patients-${
          new Date().toISOString().split("T")[0]
        }.csv"`
      );
      res.send(csvBuffer);
    }
  } catch (error) {
    console.error("Error exporting patients:", error);


    res.status(500).json({
      success: false,
      message: "فشل في تصدير بيانات المرضى",
    });
  }
});

module.exports = router;