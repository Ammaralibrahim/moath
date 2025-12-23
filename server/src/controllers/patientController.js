const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

exports.getAllPatients = async (req, res) => {
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
      .select("-__v -backupId");

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
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select(
      "-__v -backupId"
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
};

exports.createPatient = async (req, res) => {
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
};

exports.updatePatient = async (req, res) => {
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
};

exports.deletePatient = async (req, res) => {
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
};

exports.bulkDeletePatients = async (req, res) => {
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
};

exports.getPatientStats = async (req, res) => {
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

    // Age distribution
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
};

exports.searchPatients = async (req, res) => {
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
};