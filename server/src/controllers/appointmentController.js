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