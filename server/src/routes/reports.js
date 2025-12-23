const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const { createObjectCsvStringifier } = require("csv-writer");
const Backup = require("../models/Backup");

// Randevuları dışa aktar (CSV veya JSON)
router.get("/appointments/export", async (req, res) => {
  try {
    const { format = "csv", startDate, endDate, status } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate("patientId", "patientName phoneNumber birthDate gender")
      .sort({ appointmentDate: -1 })
      .select("-__v");

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لا توجد بيانات للتصدير",
      });
    }

    if (format === "json") {
      const backup = new Backup({
        filename: `appointments-export-${Date.now()}.json`,
        size: Buffer.from(JSON.stringify(appointments)).length,
        recordCount: appointments.length,
        type: "appointments",
        status: "success",
        metadata: { format: "json", startDate, endDate, status },
      });
      await backup.save();

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="appointments-${
          new Date().toISOString().split("T")[0]
        }.json"`
      );
      res.send(JSON.stringify(appointments, null, 2));
    } else {
      const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: "patientName", title: "اسم المريض" },
          { id: "phoneNumber", title: "رقم الهاتف" },
          { id: "appointmentDate", title: "تاريخ الموعد" },
          { id: "appointmentTime", title: "وقت الموعد" },
          { id: "status", title: "الحالة" },
          { id: "notes", title: "ملاحظات" },
          { id: "createdAt", title: "تاريخ الإنشاء" },
        ],
      });

      const csvData = appointments.map((apt) => ({
        patientName: apt.patientName,
        phoneNumber: apt.phoneNumber,
        appointmentDate: new Date(apt.appointmentDate).toISOString().split("T")[0],
        appointmentTime: apt.appointmentTime,
        status: apt.status === "pending" ? "قيد الانتظار" : apt.status === "confirmed" ? "مؤكد" : "ملغى",
        notes: apt.notes || "",
        createdAt: new Date(apt.createdAt).toISOString().split("T")[0],
      }));

      const csvString =
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(csvData);
      const csvBuffer = Buffer.from(`\uFEFF${csvString}`, "utf8");

      const backup = new Backup({
        filename: `appointments-export-${Date.now()}.csv`,
        size: csvBuffer.length,
        recordCount: appointments.length,
        type: "appointments",
        status: "success",
        metadata: { format: "csv", startDate, endDate, status },
      });
      await backup.save();

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="appointments-${
          new Date().toISOString().split("T")[0]
        }.csv"`
      );
      res.send(csvBuffer);
    }
  } catch (error) {
    console.error("Error exporting appointments:", error);

    const backup = new Backup({
      filename: `appointments-export-failed-${Date.now()}`,
      size: 0,
      recordCount: 0,
      type: "appointments",
      status: "failed",
      metadata: { error: error.message },
    });
    await backup.save();

    res.status(500).json({
      success: false,
      message: "فشل في تصدير بيانات المواعيد",
    });
  }
});

// Günlük rapor
router.get("/daily", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      appointmentDate: { $gte: today, $lt: tomorrow },
    })
      .populate("patientId", "patientName phoneNumber birthDate gender")
      .sort({ appointmentTime: 1 })
      .select("-__v");

    const stats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === "pending").length,
      confirmed: appointments.filter(a => a.status === "confirmed").length,
      cancelled: appointments.filter(a => a.status === "cancelled").length,
    };

    res.json({
      success: true,
      data: {
        date: today.toISOString().split("T")[0],
        appointments,
        stats,
      },
    });
  } catch (error) {
    console.error("Error generating daily report:", error);
    res.status(500).json({
      success: false,
      message: "فشل في إنشاء التقرير اليومي",
    });
  }
});

module.exports = router;