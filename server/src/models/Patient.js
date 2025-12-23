const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

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
  backupId: {
    type: String,
    default: () => uuidv4(),
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

module.exports = mongoose.model("Patient", PatientSchema);