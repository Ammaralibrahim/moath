const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");

exports.createAppointment = async (req, res) => {
  try {
    const {
      patientName,
      phoneNumber,
      appointmentDate,
      appointmentTime,
      notes,
    } = req.body;

    // Validate required fields
    if (!patientName || !phoneNumber || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: "جميع الحقول المطلوبة يجب ملؤها",
      });
    }

    // Check if the appointment date is in the future
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن حجز موعد في تاريخ مضى",
      });
    }

    // Check if appointment is on weekend (Friday or Saturday only)
    const dayOfWeek = appointmentDateTime.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن حجز موعد في أيام العطلة (الجمعة والسبت). يرجى اختيار يوم عمل من الأحد إلى الخميس.",
      });
    }

    // Check for duplicate appointment
    const existingAppointment = await Appointment.findOne({
      appointmentDate: appointmentDateTime,
      appointmentTime: appointmentTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "هذا الموعد محجوز مسبقاً. يرجى اختيار وقت آخر.",
      });
    }

    // Find or create patient
    let patient = await Patient.findOne({ phoneNumber });
    if (!patient) {
      patient = new Patient({
        patientName,
        phoneNumber,
        gender: "male", // Default
      });
      await patient.save();
    } else {
      // Update last visit date
      patient.lastVisit = new Date();
      await patient.save();
    }

    // Create new appointment
    const appointment = new Appointment({
      patientName,
      phoneNumber,
      appointmentDate: appointmentDateTime,
      appointmentTime,
      notes: notes || "",
      status: "pending",
      patientId: patient._id,
    });

    await appointment.save();

    // Update patient's appointment count
    patient.appointmentCount = await Appointment.countDocuments({
      patientId: patient._id,
    });
    patient.lastVisit = new Date();
    await patient.save();

    res.status(201).json({
      success: true,
      message: "تم حجز الموعد بنجاح",
      data: appointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "خطأ في التحقق من البيانات",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "فشل في حجز الموعد",
    });
  }
};

exports.getAdminAppointments = async (req, res) => {
  try {
    const {
      date,
      status,
      patientName,
      phoneNumber,
      page = 1,
      limit = 20,
    } = req.query;
    let query = {};

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.appointmentDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    if (status) {
      query.status = status;
    }

    if (patientName) {
      query.patientName = { $regex: patientName, $options: "i" };
    }

    if (phoneNumber) {
      query.phoneNumber = { $regex: phoneNumber, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(query)
      .populate("patientId", "patientName phoneNumber birthDate gender")
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments || [],
      count: appointments.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب المواعيد",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      status = "",
      sortBy = "appointmentDate",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Hasta var mı kontrol et
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "المريض غير موجود",
      });
    }

    const skip = (page - 1) * limit;
    let query = { patientId };

    // Durum filtresi
    if (status) {
      query.status = status;
    }

    // Sıralama
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Randevuları getir
    const appointments = await Appointment.find(query)
      .populate("patientId", "patientName phoneNumber")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const total = await Appointment.countDocuments(query);

    // Geçmiş ve gelecek randevuları ayır
    const now = new Date();
    const upcoming = appointments.filter(
      (app) => new Date(app.appointmentDate) >= now
    );
    const past = appointments.filter(
      (app) => new Date(app.appointmentDate) < now
    );

    res.json({
      success: true,
      data: appointments,
      upcomingCount: upcoming.length,
      pastCount: past.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب مواعيد المريض",
    });
  }
};

exports.getTodaysAppointments = async (req, res) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: today,
        $lt: tomorrow,
      },
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("patientId", "patientName phoneNumber gender birthDate")
      .sort({ appointmentTime: 1 })
      .select("-__v");

    // Tarihe göre grupla
    const groupedByTime = appointments.reduce((acc, appointment) => {
      const time = appointment.appointmentTime.substring(0, 2);
      if (!acc[time]) {
        acc[time] = [];
      }
      acc[time].push(appointment);
      return acc;
    }, {});

    res.json({
      success: true,
      data: appointments,
      groupedByTime,
      total: appointments.length,
      upcomingCount: appointments.filter(
        (app) => new Date(app.appointmentDate) >= today
      ).length,
    });
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب مواعيد اليوم",
    });
  }
};

// Yaklaşan randevuları getir
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: today,
        $lt: futureDate,
      },
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("patientId", "patientName phoneNumber gender birthDate")
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .select("-__v");

    // Günlere göre grupla
    const groupedByDate = appointments.reduce((acc, appointment) => {
      const date = appointment.appointmentDate.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(appointment);
      return acc;
    }, {});

    res.json({
      success: true,
      data: appointments,
      groupedByDate,
      total: appointments.length,
      fromDate: today.toISOString().split("T")[0],
      toDate: futureDate.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب المواعيد القادمة",
    });
  }
};

// Randevu istatistikleri
exports.getAppointmentStats = async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = {};

    if (patientId) {
      query.patientId = patientId;
    }

    const total = await Appointment.countDocuments(query);
    const pending = await Appointment.countDocuments({
      ...query,
      status: "pending",
    });
    const confirmed = await Appointment.countDocuments({
      ...query,
      status: "confirmed",
    });
    const completed = await Appointment.countDocuments({
      ...query,
      status: "completed",
    });
    const cancelled = await Appointment.countDocuments({
      ...query,
      status: "cancelled",
    });

    // Bugünkü randevular
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todaysCount = await Appointment.countDocuments({
      ...query,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    // Bu haftaki randevular
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyCount = await Appointment.countDocuments({
      ...query,
      appointmentDate: { $gte: weekAgo },
    });

    // Aylık istatistikler
    const monthlyStats = await Appointment.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: {
            year: { $year: "$appointmentDate" },
            month: { $month: "$appointmentDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        todaysCount,
        weeklyCount,
        monthlyStats,
      },
    });
  } catch (error) {
    console.error("Error fetching appointment stats:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب إحصائيات المواعيد",
    });
  }
};

// Filtreli randevu arama
exports.getFilteredAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      startDate,
      endDate,
      status,
      sortBy = "appointmentDate",
      sortOrder = "desc",
    } = req.query;

    let query = { patientId };

    // Tarih filtresi
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // Son tarihi dahil etmek için

      query.appointmentDate = {
        $gte: start,
        $lt: end,
      };
    } else if (startDate) {
      const start = new Date(startDate);
      query.appointmentDate = { $gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      query.appointmentDate = { $lt: end };
    }

    // Durum filtresi
    if (status) {
      query.status = status;
    }

    // Sıralama
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const appointments = await Appointment.find(query)
      .populate("patientId", "patientName phoneNumber")
      .sort(sort)
      .select("-__v");

    res.json({
      success: true,
      data: appointments,
      total: appointments.length,
    });
  } catch (error) {
    console.error("Error fetching filtered appointments:", error);
    res.status(500).json({
      success: false,
      message: "فشل في البحث عن المواعيد",
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { status, notes, patientName, phoneNumber } = req.body;

    if (!status || !["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "حالة غير صالحة",
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "الموعد غير موجود",
      });
    }

    // Update appointment
    appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    appointment.updatedAt = new Date();

    // Update patient info if provided
    if (patientName || phoneNumber) {
      if (patientName) appointment.patientName = patientName;
      if (phoneNumber) appointment.phoneNumber = phoneNumber;

      // Update linked patient if exists
      if (appointment.patientId) {
        const patient = await Patient.findById(appointment.patientId);
        if (patient) {
          if (patientName) patient.patientName = patientName;
          if (phoneNumber) patient.phoneNumber = phoneNumber;
          await patient.save();
        }
      }
    }

    await appointment.save();

    res.json({
      success: true,
      message: "تم تحديث الموعد بنجاح",
      data: appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: "فشل في تحديث الموعد",
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "الموعد غير موجود",
      });
    }

    // Update patient's appointment count if linked
    if (appointment.patientId) {
      const patient = await Patient.findById(appointment.patientId);
      if (patient) {
        patient.appointmentCount = Math.max(0, patient.appointmentCount - 1);
        await patient.save();
      }
    }

    await appointment.deleteOne();

    res.json({
      success: true,
      message: "تم حذف الموعد بنجاح",
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({
      success: false,
      message: "فشل في حذف الموعد",
    });
  }
};