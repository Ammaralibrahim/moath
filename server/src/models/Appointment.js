const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, "اسم المريض مطلوب"],
    trim: true,
    minlength: [2, "اسم المريض يجب أن يكون على الأقل حرفين"],
    maxlength: [100, "اسم المريض يجب ألا يتجاوز 100 حرف"],
  },
  phoneNumber: {
    type: String,
    required: [true, "رقم الهاتف مطلوب"],
    trim: true,
    validate: {
      validator: function (v) {
        return /^[0-9+\-\s()]{10,20}$/.test(v);
      },
      message: "الرجاء إدخال رقم هاتف صحيح",
    },
  },
  appointmentDate: {
    type: Date,
    required: [true, "تاريخ الموعد مطلوب"],
    validate: {
      validator: function (v) {
        // التحقق من أن التاريخ في المستقبل
        const isFuture = v >= new Date().setHours(0, 0, 0, 0);
        
        // التحقق من أن اليوم ليس جمعة (5) أو سبت (6) - الخميس (4) يوم عمل
        const dayOfWeek = v.getDay();
        const isNotWeekend = dayOfWeek !== 5 && dayOfWeek !== 6;
        
        return isFuture && isNotWeekend;
      },
      message: "تاريخ الموعد يجب أن يكون في المستقبل ولا يكون في يوم عطلة (الجمعة أو السبت)",
    },
  },
  appointmentTime: {
    type: String,
    required: [true, "وقت الموعد مطلوب"],
    match: [
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "الرجاء إدخال توقيت صحيح (ساعة:دقيقة)",
    ],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, "الملاحظات يجب ألا تتجاوز 500 حرف"],
    default: "",
  },
  status: {
    type: String,
    default: "pending",
    enum: {
      values: ["pending", "confirmed", "cancelled"],
      message: "حالة غير صالحة",
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
  
  // تحقق إضافي لأيام العطلة
  const dayOfWeek = this.appointmentDate.getDay();
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    const error = new mongoose.Error.ValidationError(this);
    error.errors.appointmentDate = new mongoose.Error.ValidatorError({
      message: "لا يمكن حجز موعد في أيام العطلة (الجمعة والسبت)",
      path: "appointmentDate",
      value: this.appointmentDate
    });
    return next(error);
  }
  
  next();
});

module.exports = mongoose.model("Appointment", AppointmentSchema);