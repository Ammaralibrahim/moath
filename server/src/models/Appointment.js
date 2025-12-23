const mongoose = require("mongoose");

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

module.exports = mongoose.model("Appointment", AppointmentSchema);