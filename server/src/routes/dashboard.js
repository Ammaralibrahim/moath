const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");

router.get("/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Toplam randevu sayısı
    const totalAppointments = await Appointment.countDocuments();

    // Bugünkü randevular
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
    });

    // Randevu durumlarına göre sayılar
    const pending = await Appointment.countDocuments({ status: "pending" });
    const confirmed = await Appointment.countDocuments({ status: "confirmed" });
    const cancelled = await Appointment.countDocuments({ status: "cancelled" });

    // Toplam hasta sayısı
    const totalPatients = await Patient.countDocuments();

    // Cinsiyet dağılımı
    const male = await Patient.countDocuments({ gender: "male" });
    const female = await Patient.countDocuments({ gender: "female" });

    // Randevusu olan hastalar
    const withAppointments = await Patient.countDocuments({
      appointmentCount: { $gt: 0 },
    });

    // Aktif hastalar (son 30 gün içinde randevusu olan)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activePatients = await Patient.countDocuments({
      lastVisit: { $gte: thirtyDaysAgo },
    });

    // Gelecek randevular (bugünden sonra)
    const upcoming = await Appointment.countDocuments({
      appointmentDate: { $gte: tomorrow },
      status: { $in: ["pending", "confirmed"] },
    });

    // Geçmiş randevular (bugünden önce)
    const past = await Appointment.countDocuments({
      appointmentDate: { $lt: today },
    });

    res.json({
      success: true,
      data: {
        totalAppointments,
        totalPatients,
        pending,
        confirmed,
        cancelled,
        today: todayAppointments,
        upcoming,
        past,
        male,
        female,
        withAppointments,
        activePatients,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "فشل في تحميل إحصائيات لوحة التحكم",
    });
  }
});

module.exports = router;