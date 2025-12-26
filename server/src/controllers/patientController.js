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

    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    
    const skip = (validatedPage - 1) * validatedLimit;
    let query = {};

    if (search && typeof search === 'string') {
      const safeSearch = search.replace(/[^\w\u0600-\u06FF\s@.-]/g, '');
      if (safeSearch.length > 0) {
        query.$or = [
          { patientName: { $regex: safeSearch, $options: "i" } },
          { phoneNumber: { $regex: safeSearch, $options: "i" } },
          { email: { $regex: safeSearch, $options: "i" } },
        ];
      }
    }

    if (['male', 'female'].includes(gender)) {
      query.gender = gender;
    }

    if (minAge || maxAge) {
      const today = new Date();
      const minAgeNum = parseInt(minAge);
      const maxAgeNum = parseInt(maxAge);
      
      if (minAgeNum && !isNaN(minAgeNum) && minAgeNum >= 0) {
        const minBirthDate = new Date(
          today.getFullYear() - minAgeNum,
          today.getMonth(),
          today.getDate()
        );
        query.birthDate = { ...query.birthDate, $lte: minBirthDate };
      }
      
      if (maxAgeNum && !isNaN(maxAgeNum) && maxAgeNum >= 0) {
        const maxBirthDate = new Date(
          today.getFullYear() - maxAgeNum,
          today.getMonth(),
          today.getDate()
        );
        query.birthDate = { ...query.birthDate, $gte: maxBirthDate };
      }
    }

    if (hasAppointments === "true") {
      query.appointmentCount = { $gt: 0 };
    } else if (hasAppointments === "false") {
      query.appointmentCount = 0;
    }

    if (lastVisit) {
      const date = new Date(lastVisit);
      if (!isNaN(date.getTime())) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        query.lastVisit = { $gte: date, $lt: nextDay };
      }
    }

    const allowedSortFields = ['patientName', 'createdAt', 'lastVisit', 'appointmentCount', 'birthDate'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrderValue = sortOrder === 'asc' ? 1 : -1;
    
    const sort = {};
    sort[sortField] = sortOrderValue;

    const [total, patients] = await Promise.all([
      Patient.countDocuments(query),
      Patient.find(query)
        .sort(sort)
        .skip(skip)
        .limit(validatedLimit)
        .select('-__v')
    ]);

    const patientsWithAge = patients.map((patient) => {
      const patientObj = patient.toObject();
      patientObj.age = patient.age || null;
      patientObj.formattedBirthDate = patient.birthDate 
        ? new Date(patient.birthDate).toISOString().split('T')[0]
        : null;
      patientObj.formattedLastVisit = patient.lastVisit
        ? new Date(patient.lastVisit).toLocaleDateString('ar-SA')
        : null;
      return patientObj;
    });

    res.json({
      success: true,
      message: "تم تحميل بيانات المرضى بنجاح",
      data: patientsWithAge,
      total,
      page: validatedPage,
      totalPages: Math.ceil(total / validatedLimit),
      hasMore: validatedPage * validatedLimit < total,
      filters: {
        search: search || null,
        gender: gender || null,
        minAge: minAge || null,
        maxAge: maxAge || null,
        hasAppointments: hasAppointments || null
      }
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "معايير البحث غير صحيحة",
        error: { code: 'INVALID_FILTERS' }
      });
    }
    
    res.status(500).json({
      success: false,
      message: "فشل في تحميل بيانات المرضى",
      error: {
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id).select("-__v");
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "المريض غير موجود",
      });
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .sort({ appointmentDate: -1 })
      .limit(10)
      .select("-__v");

    const patientObj = patient.toObject();
    patientObj.age = patient.age;
    patientObj.appointments = appointments;
    
    const appointmentStats = {
      total: patient.appointmentCount || 0,
      upcoming: await Appointment.countDocuments({
        patientId: patient._id,
        appointmentDate: { $gte: new Date() },
        status: { $in: ["pending", "confirmed"] },
      }),
      past: await Appointment.countDocuments({
        patientId: patient._id,
        appointmentDate: { $lt: new Date() },
      }),
      pending: await Appointment.countDocuments({
        patientId: patient._id,
        status: "pending",
      }),
      confirmed: await Appointment.countDocuments({
        patientId: patient._id,
        status: "confirmed",
      }),
      completed: await Appointment.countDocuments({
        patientId: patient._id,
        status: "completed",
      }),
      cancelled: await Appointment.countDocuments({
        patientId: patient._id,
        status: "cancelled",
      }),
    };

    patientObj.appointmentStats = appointmentStats;

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

    const existingPatient = await Patient.findOne({
      phoneNumber: patientData.phoneNumber,
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "مريض بهذا الرقم موجود بالفعل",
        data: existingPatient,
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

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "رقم الهاتف محجوز مسبقاً",
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
    const { id } = req.params;
    const updateData = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "المريض غير موجود",
      });
    }

    if (updateData.phoneNumber && updateData.phoneNumber !== patient.phoneNumber) {
      const existingPatient = await Patient.findOne({
        phoneNumber: updateData.phoneNumber,
        _id: { $ne: patient._id },
      });

      if (existingPatient) {
        return res.status(400).json({
          success: false,
          message: "رقم الهاتف محجوز مسبقاً لمريض آخر",
        });
      }
    }

    Object.assign(patient, updateData);
    patient.updatedAt = new Date();
    await patient.save();

    if (updateData.patientName || updateData.phoneNumber) {
      const appointmentUpdate = {};
      if (updateData.patientName) appointmentUpdate.patientName = updateData.patientName;
      if (updateData.phoneNumber) appointmentUpdate.phoneNumber = updateData.phoneNumber;
      
      await Appointment.updateMany(
        { patientId: patient._id },
        { 
          ...appointmentUpdate,
          updatedAt: new Date()
        }
      );
    }

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
    const { id } = req.params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "المريض غير موجود",
      });
    }

    await Patient.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "تم حذف المريض وجميع مواعيده بنجاح",
      data: {
        deletedPatientId: id,
        deletedAppointments: patient.appointmentCount,
      },
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

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const lastWeekVisits = await Patient.countDocuments({
      lastVisit: { $gte: weekAgo },
    });

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
                    31557600000
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