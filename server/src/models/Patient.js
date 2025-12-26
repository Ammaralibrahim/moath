const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, "اسم المريض مطلوب"],
    trim: true,
    minlength: [2, "اسم المريض يجب أن يكون على الأقل حرفين"],
    maxlength: [100, "اسم المريض يجب ألا يتجاوز 100 حرف"],
    index: true,
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
  birthDate: {
    type: Date,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return v <= new Date();
      },
      message: "تاريخ الميلاد لا يمكن أن يكون في المستقبل",
    },
  },
  gender: {
    type: String,
    enum: {
      values: ["male", "female"],
      message: "قيمة الجنس غير صالحة",
    },
    default: "male",
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, "العنوان يجب ألا يتجاوز 500 حرف"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "الرجاء إدخال بريد إلكتروني صحيح"],
  },
  emergencyContact: {
    type: String,
    trim: true,
  },
  medicalHistory: {
    type: String,
    trim: true,
    maxlength: [2000, "التاريخ الطبي يجب ألا يتجاوز 2000 حرف"],
  },
  allergies: {
    type: String,
    trim: true,
    maxlength: [500, "الحساسية يجب ألا تتجاوز 500 حرف"],
  },
  medications: {
    type: String,
    trim: true,
    maxlength: [500, "الأدوية يجب ألا تتجاوز 500 حرف"],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, "الملاحظات يجب ألا تتجاوز 1000 حرف"],
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
});
PatientSchema.index({ gender: 1 });
PatientSchema.index({ birthDate: 1 });
PatientSchema.index({ lastVisit: -1 });
PatientSchema.index({ appointmentCount: -1 });
PatientSchema.index({ isActive: 1 });
PatientSchema.index({ createdAt: -1 });

PatientSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  
  if (this.email && !/^\S+@\S+\.\S+$/.test(this.email)) {
    const error = new mongoose.Error.ValidationError(this);
    error.errors.email = new mongoose.Error.ValidatorError({
      message: "البريد الإلكتروني غير صالح",
      path: "email",
      value: this.email
    });
    return next(error);
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

PatientSchema.set('toJSON', { virtuals: true });
PatientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Patient", PatientSchema);