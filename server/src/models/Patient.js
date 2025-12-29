const mongoose = require("mongoose");

const InsuranceSchema = new mongoose.Schema({
  companyName: {
    type: String,
    trim: true,
    maxlength: [200, "اسم شركة التأمين يجب ألا يتجاوز 200 حرف"],
  },
  policyNumber: {
    type: String,
    trim: true,
    maxlength: [100, "رقم البوليصة يجب ألا يتجاوز 100 حرف"],
  },
  coveragePercentage: {
    type: Number,
    min: [0, "نسبة التغطية لا يمكن أن تكون أقل من 0"],
    max: [100, "نسبة التغطية لا يمكن أن تكون أكثر من 100"],
  },
  expiryDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, "ملاحظات التأمين يجب ألا تتجاوز 500 حرف"],
  },
});

const ReferralSourceSchema = new mongoose.Schema({
  doctorName: {
    type: String,
    trim: true,
    maxlength: [200, "اسم الطبيب يجب ألا يتجاوز 200 حرف"],
  },
  clinicName: {
    type: String,
    trim: true,
    maxlength: [200, "اسم العيادة يجب ألا يتجاوز 200 حرف"],
  },
  referralDate: {
    type: Date,
    default: Date.now,
  },
  specialty: {
    type: String,
    trim: true,
    maxlength: [200, "التخصص يجب ألا يتجاوز 200 حرف"],
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "الرجاء إدخال بريد إلكتروني صحيح"],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, "ملاحظات الإحالة يجب ألا تتجاوز 500 حرف"],
  },
});

const PatientSchema = new mongoose.Schema({
  // البيانات الديموغرافية
  patientName: {
    type: String,
    required: [true, "اسم المريض مطلوب"],
    trim: true,
    minlength: [2, "اسم المريض يجب أن يكون على الأقل حرفين"],
    maxlength: [100, "اسم المريض يجب ألا يتجاوز 100 حرف"],
    index: true,
  },
  birthDate: {
    type: Date,
    required: [true, "تاريخ الميلاد مطلوب"],
    validate: {
      validator: function (v) {
        return v <= new Date();
      },
      message: "تاريخ الميلاد لا يمكن أن يكون في المستقبل",
    },
  },
  gender: {
    type: String,
    required: [true, "الجنس مطلوب"],
    enum: {
      values: ["male", "female"],
      message: "قيمة الجنس غير صالحة",
    },
    default: "male",
  },
  address: {
    type: String,
    required: [true, "العنوان مطلوب"],
    trim: true,
    maxlength: [500, "العنوان يجب ألا يتجاوز 500 حرف"],
  },
  phoneNumber: {
    type: String,
    required: [true, "رقم الهاتف مطلوب"],
    trim: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[0-9+\-\s()]{10,20}$/.test(v);
      },
      message: "الرجاء إدخال رقم هاتف صحيح",
    },
    index: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "الرجاء إدخال بريد إلكتروني صحيح"],
  },
  nationalAddress: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, "اسم الشارع يجب ألا يتجاوز 200 حرف"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "اسم المدينة يجب ألا يتجاوز 100 حرف"],
    },
    district: {
      type: String,
      trim: true,
      maxlength: [100, "اسم الحي يجب ألا يتجاوز 100 حرف"],
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [20, "الرمز البريدي يجب ألا يتجاوز 20 حرف"],
    },
    buildingNumber: {
      type: String,
      trim: true,
      maxlength: [50, "رقم المبنى يجب ألا يتجاوز 50 حرف"],
    },
    additionalNumber: {
      type: String,
      trim: true,
      maxlength: [50, "الرقم الإضافي يجب ألا يتجاوز 50 حرف"],
    },
  },
  
  // معلومات التسجيل
  patientId: {
    type: String,
    unique: true,
    trim: true,
    maxlength: [50, "رقم الملف يجب ألا يتجاوز 50 حرف"],
    index: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  referralSources: [ReferralSourceSchema],
  lastVisitDate: {
    type: Date,
  },
  
  // البيانات الطبية الأساسية
  medicalSummary: {
    type: String,
    trim: true,
    maxlength: [2000, "التاريخ الطبي الموجز يجب ألا يتجاوز 2000 حرف"],
  },
  allergies: {
    type: String,
    trim: true,
    maxlength: [1000, "الحساسيات يجب ألا تتجاوز 1000 حرف"],
  },
  currentMedications: {
    type: String,
    trim: true,
    maxlength: [1000, "الأدوية الحالية يجب ألا تتجاوز 1000 حرف"],
  },
  weight: {
    type: Number,
    min: [0, "الوزن لا يمكن أن يكون سالباً"],
    max: [300, "الوزن لا يمكن أن يتجاوز 300 كجم"],
  },
  height: {
    type: Number,
    min: [0, "الطول لا يمكن أن يكون سالباً"],
    max: [250, "الطول لا يمكن أن يتجاوز 250 سم"],
  },
  bmi: {
    type: Number,
    min: [0, "مؤشر كتلة الجسم لا يمكن أن يكون سالباً"],
    max: [100, "مؤشر كتلة الجسم لا يمكن أن يتجاوز 100"],
  },
  
  // بيانات التأمين
  insurance: InsuranceSchema,
  
  // معلومات إضافية لـ RIS
  doctorSuggestions: {
    type: String,
    trim: true,
    maxlength: [2000, "التوصيات الطبية يجب ألا تتجاوز 2000 حرف"],
  },
  testResults: [{
    testName: {
      type: String,
      trim: true,
      maxlength: [200, "اسم الفحص يجب ألا يتجاوز 200 حرف"],
    },
    testDate: {
      type: Date,
      default: Date.now,
    },
    result: {
      type: String,
      trim: true,
      maxlength: [500, "نتيجة الفحص يجب ألا تتجاوز 500 حرف"],
    },
    normalRange: {
      type: String,
      trim: true,
      maxlength: [200, "المعدل الطبيعي يجب ألا يتجاوز 200 حرف"],
    },
    unit: {
      type: String,
      trim: true,
      maxlength: [50, "الوحدة يجب ألا تتجاوز 50 حرف"],
    },
    labName: {
      type: String,
      trim: true,
      maxlength: [200, "اسم المختبر يجب ألا يتجاوز 200 حرف"],
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "ملاحظات الفحص يجب ألا تتجاوز 500 حرف"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  lastTestDate: {
    type: Date,
  },
  lastDoctorVisit: {
    type: Date,
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'غير معروف'],
    default: 'غير معروف',
  },
  chronicDiseases: [{
    diseaseName: {
      type: String,
      trim: true,
      maxlength: [200, "اسم المرض يجب ألا يتجاوز 200 حرف"],
    },
    diagnosisDate: {
      type: Date,
    },
    severity: {
      type: String,
      enum: ['خفيف', 'متوسط', 'شديد'],
    },
    currentStatus: {
      type: String,
      enum: ['نشط', 'متحكم به', 'مستقر', 'في تحسن'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "ملاحظات المرض يجب ألا تتجاوز 500 حرف"],
    },
  }],
  
  // حالة المريض
  isActive: {
    type: Boolean,
    default: true,
  },
  appointmentCount: {
    type: Number,
    default: 0,
    min: [0, "عدد المواعيد لا يمكن أن يكون سالباً"],
  },
  totalVisits: {
    type: Number,
    default: 0,
    min: [0, "إجمالي الزيارات لا يمكن أن يكون سالباً"],
  },
  originalId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  backupData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
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
  patientId: "text",
});
PatientSchema.index({ gender: 1 });
PatientSchema.index({ birthDate: 1 });
PatientSchema.index({ lastVisitDate: -1 });
PatientSchema.index({ registrationDate: -1 });
PatientSchema.index({ appointmentCount: -1 });
PatientSchema.index({ isActive: 1 });
PatientSchema.index({ createdAt: -1 });
PatientSchema.index({ bloodType: 1 });
PatientSchema.index({ 'chronicDiseases.diseaseName': 1 });
PatientSchema.index({ 'insurance.companyName': 1 });
PatientSchema.index({ 'referralSources.doctorName': 1 });

PatientSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  
  // توليد رقم ملف فريد إذا لم يكن موجوداً
  if (!this.patientId) {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    this.patientId = `PAT-${year}-${randomNum}`;
  }
  
  // حساب BMI إذا كان الوزن والطول موجودين
  if (this.weight && this.height && this.height > 0) {
    const heightInMeters = this.height / 100;
    this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(2));
  }
  
  // التحقق من البريد الإلكتروني
  if (this.email && !/^\S+@\S+\.\S+$/.test(this.email)) {
    const error = new mongoose.Error.ValidationError(this);
    error.errors.email = new mongoose.Error.ValidatorError({
      message: "البريد الإلكتروني غير صالح",
      path: "email",
      value: this.email
    });
    return next(error);
  }
  
  // تحديث تاريخ آخر فحص
  if (this.testResults && this.testResults.length > 0) {
    const latestTest = this.testResults.reduce((latest, test) => {
      return new Date(test.testDate) > new Date(latest.testDate) ? test : latest;
    });
    this.lastTestDate = latestTest.testDate;
  }
  
  next();
});

PatientSchema.pre('findOneAndDelete', async function(next) {
  try {
    const patient = await this.model.findOne(this.getQuery());
    if (patient) {
      const Appointment = mongoose.model('Appointment');
      await Appointment.deleteMany({ patientId: patient._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});

PatientSchema.post('findOneAndDelete', async function(doc) {
  try {
    if (doc) {
      console.log(`Patient ${doc._id} and all associated appointments deleted successfully`);
    }
  } catch (error) {
    console.error('Error in post-delete middleware:', error);
  }
});

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

PatientSchema.virtual('bmiCategory').get(function() {
  if (!this.bmi) return null;
  if (this.bmi < 18.5) return 'نحيف';
  if (this.bmi < 25) return 'طبيعي';
  if (this.bmi < 30) return 'وزن زائد';
  return 'سمين';
});

PatientSchema.virtual('latestTestResult').get(function() {
  if (!this.testResults || this.testResults.length === 0) return null;
  
  return this.testResults.reduce((latest, test) => {
    return new Date(test.testDate) > new Date(latest.testDate) ? test : latest;
  });
});

PatientSchema.virtual('primaryReferral').get(function() {
  if (!this.referralSources || this.referralSources.length === 0) return null;
  return this.referralSources[0];
});

PatientSchema.set('toJSON', { virtuals: true });
PatientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Patient", PatientSchema);