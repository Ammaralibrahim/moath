const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");

const validateAppointmentDateTime = async (appointmentDate, appointmentTime, patientId = null, appointmentId = null) => {
  const appointmentDateTime = new Date(appointmentDate);
  
  if (appointmentDateTime < new Date().setHours(0, 0, 0, 0)) {
    return { valid: false, message: "لا يمكن حجز موعد في تاريخ مضى" };
  }
  
  const dayOfWeek = appointmentDateTime.getDay();
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    return { valid: false, message: "لا يمكن حجز موعد في أيام العطلة (الجمعة والسبت)" };
  }
  
  const query = {
    appointmentDate: appointmentDateTime,
    appointmentTime: appointmentTime,
    status: { $in: ["pending", "confirmed"] },
  };
  
  if (patientId) {
    query.patientId = patientId;
  }
  
  if (appointmentId) {
    query._id = { $ne: appointmentId };
  }
  
  const existingAppointment = await Appointment.findOne(query);
  if (existingAppointment) {
    return { valid: false, message: "هذا الموعد محجوز مسبقاً للمريض" };
  }
  
  return { valid: true };
};

exports.createAppointment = async (req, res) => {
  try {
    const {
      patientName,
      phoneNumber,
      appointmentDate,
      appointmentTime,
      notes,
      diagnosis,
      prescription,
      doctorSuggestions,
      testResults,
      followUpDate,
      followUpNotes,
      patientId,
      birthDate,  // إضافة birthDate
      address,    // إضافة address
      email,      // إضافة email
    } = req.body;

    if (!patientName || !phoneNumber || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: "جميع الحقول المطلوبة يجب ملؤها (الاسم، الهاتف، التاريخ، الوقت)",
      });
    }

    const validation = await validateAppointmentDateTime(appointmentDate, appointmentTime, patientId);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    let patient;
    if (patientId) {
      patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "المريض غير موجود",
        });
      }
    } else {
      // البحث بالمريض باستخدام رقم الهاتف
      patient = await Patient.findOne({ phoneNumber });
      
      if (!patient) {
        // إنشاء مريض جديد مع البيانات الأساسية فقط
        patient = new Patient({
          patientName,
          phoneNumber,
          gender: "male",
          birthDate: birthDate || null,  // استخدام القيمة المرسلة أو null
          address: address || "",         // استخدام القيمة المرسلة أو string فارغ
          email: email || "",            // استخدام القيمة المرسلة أو string فارغ
        });
        
        try {
          await patient.save();
        } catch (patientError) {
          // إذا فشل حفظ المريض، إرجاع خطأ مفصل
          if (patientError.name === "ValidationError") {
            const errors = Object.values(patientError.errors).map((err) => err.message);
            return res.status(400).json({
              success: false,
              message: "خطأ في بيانات المريض",
              errors: errors,
            });
          }
          throw patientError;
        }
      }
    }

    // إنشاء الموعد
    const appointment = new Appointment({
      patientName,
      phoneNumber,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      notes: notes || "",
      diagnosis: diagnosis || "",
      prescription: prescription || "",
      doctorSuggestions: doctorSuggestions || "",
      testResults: testResults || [],
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      followUpNotes: followUpNotes || "",
      status: "pending",
      patientId: patient._id,
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'patientName phoneNumber birthDate gender email address');

    res.status(201).json({
      success: true,
      message: "تم حجز الموعد بنجاح",
      data: populatedAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "خطأ في التحقق من بيانات الموعد",
        errors: errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "هذا الموعد محجوز مسبقاً",
      });
    }

    res.status(500).json({
      success: false,
      message: "فشل في حجز الموعد",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
      patientId,
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

    if (patientId) {
      query.patientId = patientId;
    }

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(query)
      .populate("patientId", "patientName phoneNumber birthDate gender email address")
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

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "المريض غير موجود",
      });
    }

    const skip = (page - 1) * limit;
    let query = { patientId };

    if (status) {
      query.status = status;
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const appointments = await Appointment.find(query)
      .populate("patientId", "patientName phoneNumber birthDate gender")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const total = await Appointment.countDocuments(query);

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

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyCount = await Appointment.countDocuments({
      ...query,
      appointmentDate: { $gte: weekAgo },
    });

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

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);

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

    if (status) {
      query.status = status;
    }

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
    const { id } = req.params;
    const { 
      status, 
      notes, 
      patientName, 
      phoneNumber, 
      appointmentDate, 
      appointmentTime,
      diagnosis,
      prescription,
      doctorSuggestions,
      testResults,
      followUpDate,
      followUpNotes 
    } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "الموعد غير موجود",
      });
    }

    if (appointmentDate && appointmentTime) {
      const validation = await validateAppointmentDateTime(
        appointmentDate, 
        appointmentTime, 
        appointment.patientId, 
        id
      );
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }
    }

    if (status && !["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "حالة غير صالحة",
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
    if (appointmentTime) updateData.appointmentTime = appointmentTime;
    if (patientName) updateData.patientName = patientName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    if (prescription !== undefined) updateData.prescription = prescription;
    if (doctorSuggestions !== undefined) updateData.doctorSuggestions = doctorSuggestions;
    if (testResults !== undefined) updateData.testResults = testResults;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (followUpNotes !== undefined) updateData.followUpNotes = followUpNotes;
    
    updateData.updatedAt = new Date();

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("patientId", "patientName phoneNumber birthDate gender email bloodType chronicDiseases");

    if (appointment.patientId && (patientName || phoneNumber)) {
      const patientUpdate = {};
      if (patientName) patientUpdate.patientName = patientName;
      if (phoneNumber) patientUpdate.phoneNumber = phoneNumber;
      patientUpdate.updatedAt = new Date();
      
      await Patient.findByIdAndUpdate(
        appointment.patientId,
        patientUpdate,
        { new: true }
      );
    }

    res.json({
      success: true,
      message: "تم تحديث الموعد بنجاح",
      data: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    
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
      message: "فشل في تحديث الموعد",
    });
  }
};


exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "الموعد غير موجود",
      });
    }

    const patientId = appointment.patientId;

    await Appointment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "تم حذف الموعد بنجاح",
      data: {
        deletedAppointmentId: id,
        patientId: patientId,
      },
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({
      success: false,
      message: "فشل في حذف الموعد",
    });
  }
};