const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const { createObjectCsvStringifier } = require("csv-writer");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: ['https://alsawaf.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key', 'X-Requested-With']
}));

// OPTIONS isteklerini özel olarak handle et
app.options('*', cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with better error handling
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/poliklinik";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ MongoDB bağlantısı başarılı");
  })
  .catch((error) => {
    console.error("❌ MongoDB bağlantı hatası:", error);
    process.exit(1);
  });



// Enhanced Appointment Schema
const AppointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, "Hasta adı soyadı gereklidir"],
    trim: true,
    minlength: [2, "Hasta adı en az 2 karakter olmalıdır"],
    maxlength: [100, "Hasta adı en fazla 100 karakter olmalıdır"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Telefon numarası gereklidir"],
    trim: true,
    validate: {
      validator: function (v) {
        return /^[0-9+\-\s()]{10,20}$/.test(v);
      },
      message: "Geçerli bir telefon numarası giriniz",
    },
  },
  appointmentDate: {
    type: Date,
    required: [true, "Randevu tarihi gereklidir"],
    validate: {
      validator: function (v) {
        return v >= new Date().setHours(0, 0, 0, 0);
      },
      message: "Randevu tarihi geçmiş bir tarih olamaz",
    },
  },
  appointmentTime: {
    type: String,
    required: [true, "Randevu saati gereklidir"],
    match: [
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Geçerli bir saat formatı giriniz (HH:MM)",
    ],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, "Notlar en fazla 500 karakter olabilir"],
    default: "",
  },
  status: {
    type: String,
    default: "pending",
    enum: {
      values: ["pending", "confirmed", "cancelled"],
      message: "Geçersiz durum değeri",
    },
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

AppointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
AppointmentSchema.index({ patientId: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ createdAt: -1 });

AppointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Appointment = mongoose.model("Appointment", AppointmentSchema);

// Enhanced Patient Schema
const PatientSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, "Hasta adı soyadı gereklidir"],
    trim: true,
    minlength: [2, "Hasta adı en az 2 karakter olmalıdır"],
    maxlength: [100, "Hasta adı en fazla 100 karakter olmalıdır"],
    index: true,
  },
  phoneNumber: {
    type: String,
    required: [true, "Telefon numarası gereklidir"],
    trim: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[0-9+\-\s()]{10,20}$/.test(v);
      },
      message: "Geçerli bir telefon numarası giriniz",
    },
    index: true,
  },
  birthDate: {
    type: Date,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return v <= new Date();
      },
      message: "Doğum tarihi gelecekte olamaz",
    },
  },
  gender: {
    type: String,
    enum: {
      values: ["male", "female"],
      message: "Geçersiz cinsiyet değeri",
    },
    default: "male",
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, "Adres en fazla 500 karakter olabilir"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Geçerli bir email adresi giriniz"],
  },
  emergencyContact: {
    type: String,
    trim: true,
  },
  medicalHistory: {
    type: String,
    trim: true,
    maxlength: [2000, "Tıbbi geçmiş en fazla 2000 karakter olabilir"],
  },
  allergies: {
    type: String,
    trim: true,
    maxlength: [500, "Alerjiler en fazla 500 karakter olabilir"],
  },
  medications: {
    type: String,
    trim: true,
    maxlength: [500, "İlaçlar en fazla 500 karakter olabilir"],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, "Notlar en fazla 1000 karakter olabilir"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastVisit: {
    type: Date,
  },
  appointmentCount: {
    type: Number,
    default: 0,
  },
  totalVisits: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PatientSchema.index({
  patientName: "text",
  phoneNumber: "text",
  email: "text",
});
PatientSchema.index({ gender: 1 });
PatientSchema.index({ birthDate: 1 });
PatientSchema.index({ lastVisit: -1 });
PatientSchema.index({ appointmentCount: -1 });
PatientSchema.index({ isActive: 1 });

PatientSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for age calculation
PatientSchema.virtual("age").get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

const Patient = mongoose.model("Patient", PatientSchema);



// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];
  const expectedKey = process.env.ADMIN_API_KEY || "admin123";

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: "غير مصرح بالوصول - تحقق من مفتاح المصادقة",
    });
  }
  next();
};

// Health check with better response
app.get("/api/health", async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    const patientCount = await Patient.countDocuments();
    const appointmentCount = await Appointment.countDocuments();

    res.json({
      success: true,
      message: "API çalışıyor",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      stats: {
        patients: patientCount,
        appointments: appointmentCount,
      },
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
    });
  }
});

// Get system info
app.get("/api/system/info", authenticateAdmin, async (req, res) => {
  try {
    const stats = await mongoose.connection.db.stats();

    res.json({
      success: true,
      data: {
        database: {
          name: stats.db,
          collections: stats.collections,
          objects: stats.objects,
          avgObjSize: stats.avgObjSize,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes,
          indexSize: stats.indexSize,
        },
        server: {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
        },
      },
    });
  } catch (error) {
    console.error("Error getting system info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get system info",
    });
  }
});

// ==================== PATIENTS ENDPOINTS ====================

// Get all patients with pagination and filtering
app.get("/api/patients", authenticateAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      gender = "",
      minAge = "",
      maxAge = "",
      hasAppointments = "",
      lastVisit = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (page - 1) * limit;
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Gender filter
    if (gender) {
      query.gender = gender;
    }

    // Age filter
    if (minAge || maxAge) {
      const today = new Date();
      const minBirthDate = maxAge
        ? new Date(
            today.getFullYear() - maxAge,
            today.getMonth(),
            today.getDate()
          )
        : null;
      const maxBirthDate = minAge
        ? new Date(
            today.getFullYear() - minAge,
            today.getMonth(),
            today.getDate()
          )
        : null;

      if (minBirthDate && maxBirthDate) {
        query.birthDate = { $gte: minBirthDate, $lte: maxBirthDate };
      } else if (minBirthDate) {
        query.birthDate = { $gte: minBirthDate };
      } else if (maxBirthDate) {
        query.birthDate = { $lte: maxBirthDate };
      }
    }

    // Has appointments filter
    if (hasAppointments === "true") {
      query.appointmentCount = { $gt: 0 };
    } else if (hasAppointments === "false") {
      query.appointmentCount = 0;
    }

    // Last visit filter
    if (lastVisit) {
      const date = new Date(lastVisit);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.lastVisit = { $gte: date, $lt: nextDay };
    }

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get patients
    const patients = await Patient.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const total = await Patient.countDocuments(query);

    // Calculate age for each patient
    const patientsWithAge = patients.map((patient) => {
      const patientObj = patient.toObject();
      patientObj.age = patient.age;
      return patientObj;
    });

    res.json({
      success: true,
      data: patientsWithAge,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب بيانات المرضى",
    });
  }
});

// Get patient by ID
app.get("/api/patients/:id", authenticateAdmin, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select(
      "-__v"
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "المريض غير موجود",
      });
    }

    // Get patient's appointments
    const appointments = await Appointment.find({ patientId: patient._id })
      .sort({ appointmentDate: -1 })
      .select("-__v");

    const patientObj = patient.toObject();
    patientObj.age = patient.age;
    patientObj.appointments = appointments;

    res.json({
      success: true,
      data: patientObj,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب بيانات المريض",
    });
  }
});

// Create new patient
app.post("/api/patients", authenticateAdmin, async (req, res) => {
  try {
    const patientData = req.body;

    // Check if patient already exists with same phone number
    const existingPatient = await Patient.findOne({
      phoneNumber: patientData.phoneNumber,
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "مريض بهذا الرقم موجود بالفعل",
      });
    }

    const patient = new Patient(patientData);
    await patient.save();

    res.status(201).json({
      success: true,
      message: "تم إنشاء المريض بنجاح",
      data: patient,
    });
  } catch (error) {
    console.error("Error creating patient:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "خطأ في التحقق من البيانات",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "فشل في إنشاء المريض",
    });
  }
});

// Update patient
app.put("/api/patients/:id", authenticateAdmin, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "المريض غير موجود",
      });
    }

    // Check if phone number is being changed and if it conflicts
    if (req.body.phoneNumber && req.body.phoneNumber !== patient.phoneNumber) {
      const existingPatient = await Patient.findOne({
        phoneNumber: req.body.phoneNumber,
        _id: { $ne: patient._id },
      });

      if (existingPatient) {
        return res.status(400).json({
          success: false,
          message: "رقم الهاتف محجوز مسبقاً لمريض آخر",
        });
      }
    }

    Object.assign(patient, req.body);
    await patient.save();

    res.json({
      success: true,
      message: "تم تحديث بيانات المريض بنجاح",
      data: patient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "خطأ في التحقق من البيانات",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "فشل في تحديث بيانات المريض",
    });
  }
});

// Delete patient
app.delete("/api/patients/:id", authenticateAdmin, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "المريض غير موجود",
      });
    }

    // Check if patient has appointments
    const appointmentCount = await Appointment.countDocuments({
      patientId: patient._id,
    });

    if (appointmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن حذف المريض لأنه لديه مواعيد مرتبطة",
      });
    }

    await patient.deleteOne();

    res.json({
      success: true,
      message: "تم حذف المريض بنجاح",
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({
      success: false,
      message: "فشل في حذف المريض",
    });
  }
});

// Bulk delete patients
app.post("/api/patients/bulk-delete", authenticateAdmin, async (req, res) => {
  try {
    const { patientIds } = req.body;

    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "لم يتم تحديد أي مرضى للحذف",
      });
    }

    // Check if any patients have appointments
    const patientsWithAppointments = await Appointment.find({
      patientId: { $in: patientIds },
    }).distinct("patientId");

    if (patientsWithAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: "بعض المرضى لديهم مواعيد مرتبطة ولا يمكن حذفهم",
        patientsWithAppointments,
      });
    }

    const result = await Patient.deleteMany({ _id: { $in: patientIds } });

    res.json({
      success: true,
      message: `تم حذف ${result.deletedCount} مريض بنجاح`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting patients:", error);
    res.status(500).json({
      success: false,
      message: "فشل في حذف المرضى",
    });
  }
});

// Export patients to CSV
app.get("/api/patients/export", authenticateAdmin, async (req, res) => {
  try {
    const { format = "csv", includeAppointments = "false" } = req.query;
    const patients = await Patient.find().select("-__v");

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

// تحديث مسار /api/patients/stats
app.get("/api/patients/stats", authenticateAdmin, async (req, res) => {
  try {
    const total = await Patient.countDocuments();
    const male = await Patient.countDocuments({ gender: "male" });
    const female = await Patient.countDocuments({ gender: "female" });
    const withAppointments = await Patient.countDocuments({
      appointmentCount: { $gt: 0 },
    });
    const active = await Patient.countDocuments({ isActive: true });

    // Last week visits
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const lastWeekVisits = await Patient.countDocuments({
      lastVisit: { $gte: weekAgo },
    });

    // Age distribution - تصحيح حساب العمر
    const ageGroups = await Patient.aggregate([
      {
        $match: {
          birthDate: { $exists: true, $ne: null }
        }
      },
      {
        $project: {
          age: {
            $cond: {
              if: { $eq: ["$birthDate", null] },
              then: null,
              else: {
                $floor: {
                  $divide: [
                    { $subtract: [new Date(), "$birthDate"] },
                    31557600000 // milliseconds in a year (365.25 days)
                  ]
                }
              }
            }
          }
        }
      },
      {
        $match: {
          age: { $ne: null, $gte: 0 }
        }
      },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 18, 30, 45, 60, 100],
          default: "other",
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    // Monthly patient registration
    const monthlyRegistrations = await Patient.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        total,
        male,
        female,
        withAppointments,
        active,
        lastWeekVisits,
        ageGroups,
        monthlyRegistrations,
      },
    });
  } catch (error) {
    console.error("Error getting patient stats:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب إحصائيات المرضى",
      error: error.message
    });
  }
});
// Search patients by phone or name
app.get("/api/patients/search/:query", authenticateAdmin, async (req, res) => {
  try {
    const query = req.params.query;

    const patients = await Patient.find({
      $or: [
        { patientName: { $regex: query, $options: "i" } },
        { phoneNumber: { $regex: query, $options: "i" } },
      ],
    })
      .limit(10)
      .select("patientName phoneNumber birthDate gender");

    const patientsWithAge = patients.map((patient) => {
      const patientObj = patient.toObject();
      patientObj.age = patient.age;
      return patientObj;
    });

    res.json({
      success: true,
      data: patientsWithAge,
    });
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({
      success: false,
      message: "فشل في البحث عن المرضى",
    });
  }
});



// ==================== EXISTING APPOINTMENT ENDPOINTS (UPDATED) ====================

// Create new appointment (link to patient if exists)
app.post("/api/appointments", async (req, res) => {
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
});

// Get all appointments with filtering (updated to include patient info)
app.get("/api/admin/appointments", authenticateAdmin, async (req, res) => {
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
});

// Update appointment (also update patient if needed)
app.put("/api/admin/appointments/:id", authenticateAdmin, async (req, res) => {
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
});

// Delete appointment (update patient stats)
app.delete(
  "/api/admin/appointments/:id",
  authenticateAdmin,
  async (req, res) => {
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
  }
);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled Error:", error);
  res.status(500).json({
    success: false,
    message: "حدث خطأ غير متوقع في الخادم",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint غير موجود",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor.`);
  console.log(`📊 API URL: http://localhost:${PORT}`);
  console.log(`🔑 Admin Key: ${process.env.ADMIN_API_KEY || "admin123"}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
