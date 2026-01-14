const mongoose = require("mongoose");

const TestResultSchema = new mongoose.Schema({
  testName: {
    type: String,
    trim: true,
    maxlength: [200, "اسم الفحص يجب ألا يتجاوز 200 حرف"],
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
  notes: {
    type: String,
    trim: true,
    maxlength: [500, "ملاحظات الفحص يجب ألا تتجاوز 500 حرف"],
  },
});

const AppointmentSchema = new mongoose.Schema({
   appointmentNumber: {
    type: String,
    unique: true,
    sparse: true, // هذا يسمح بقيم null متعددة
    default: function() {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      return `APP-${year}-${randomNum}`;
    }
  },
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
  },
  appointmentDate: {
    type: Date,
    required: [true, "تاريخ الموعد مطلوب"],
    validate: {
      validator: function (v) {
        if (!v) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const appointmentDate = new Date(v);
        appointmentDate.setHours(0, 0, 0, 0);
        
        const isFuture = appointmentDate >= today;
        const dayOfWeek = appointmentDate.getDay();
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
  diagnosis: {
    type: String,
    trim: true,
    maxlength: [1000, "التشخيص يجب ألا يتجاوز 1000 حرف"],
  },
  prescription: {
    type: String,
    trim: true,
    maxlength: [2000, "الوصفة الطبية يجب ألا تتجاوز 2000 حرف"],
  },
  doctorSuggestions: {
    type: String,
    trim: true,
    maxlength: [2000, "التوصيات الطبية يجب ألا تتجاوز 2000 حرف"],
  },
  testResults: [TestResultSchema],
  followUpDate: {
    type: Date,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return v > new Date();
      },
      message: "تاريخ المتابعة يجب أن يكون في المستقبل",
    },
  },
  followUpNotes: {
    type: String,
    trim: true,
    maxlength: [500, "ملاحظات المتابعة يجب ألا تتجاوز 500 حرف"],
  },
  status: {
    type: String,
    default: "pending",
    enum: {
      values: ["pending", "confirmed", "completed", "cancelled"],
      message: "حالة غير صالحة",
    },
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: [true, "معرف المريض مطلوب"],
  },
  originalId: {
    type: String,
    unique: true,
    sparse: true,
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

// إزالة الفهرس المكرر - يجب أن يكون مرة واحدة فقط
// الاحتفاظ بـ index() فقط وإزالة index: true من الحقول

AppointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ patientId: 1, appointmentDate: 1 });
AppointmentSchema.index({ followUpDate: 1 });

AppointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  
  if (this.appointmentDate) {
    const appointmentDate = new Date(this.appointmentDate);
    const dayOfWeek = appointmentDate.getDay();
    
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      const error = new mongoose.Error.ValidationError(this);
      error.errors.appointmentDate = new mongoose.Error.ValidatorError({
        message: "لا يمكن حجز موعد في أيام العطلة (الجمعة والسبت)",
        path: "appointmentDate",
        value: this.appointmentDate
      });
      return next(error);
    }
  }
  
  next();
});

AppointmentSchema.post('save', async function(doc) {
  try {
    const Patient = mongoose.model('Patient');
    if (doc.patientId) {
      const appointmentCount = await mongoose.model('Appointment').countDocuments({
        patientId: doc.patientId
      });
      
      const latestAppointment = await mongoose.model('Appointment')
        .findOne({ patientId: doc.patientId })
        .sort({ appointmentDate: -1, appointmentTime: -1 });
      
      const updateData = {
        appointmentCount: appointmentCount,
        lastVisit: latestAppointment ? latestAppointment.appointmentDate : null,
        updatedAt: new Date()
      };

      if (doc.status === 'completed') {
        updateData.lastDoctorVisit = doc.appointmentDate;
        
        if (doc.doctorSuggestions) {
          updateData.doctorSuggestions = doc.doctorSuggestions;
        }
        
        if (doc.testResults && doc.testResults.length > 0) {
          const existingPatient = await Patient.findById(doc.patientId);
          const newTestResults = doc.testResults.map(test => ({
            ...test.toObject(),
            testDate: doc.appointmentDate,
            labName: test.labName || 'غير محدد'
          }));
          
          updateData.testResults = [...(existingPatient.testResults || []), ...newTestResults];
          updateData.lastTestDate = doc.appointmentDate;
        }
      }
      
      await Patient.findByIdAndUpdate(doc.patientId, updateData, { new: true });
    }
  } catch (error) {
    console.error('Error updating patient after appointment save:', error);
  }
});

AppointmentSchema.post('findOneAndDelete', async function(doc) {
  try {
    if (doc && doc.patientId) {
      const Patient = mongoose.model('Patient');
      const Appointment = mongoose.model('Appointment');
      
      const appointmentCount = await Appointment.countDocuments({
        patientId: doc.patientId
      });
      
      const latestAppointment = await Appointment
        .findOne({ patientId: doc.patientId })
        .sort({ appointmentDate: -1, appointmentTime: -1 });
      
      await Patient.findByIdAndUpdate(doc.patientId, {
        appointmentCount: appointmentCount,
        lastVisit: latestAppointment ? latestAppointment.appointmentDate : null,
        updatedAt: new Date()
      }, { new: true });
    }
  } catch (error) {
    console.error('Error updating patient after appointment delete:', error);
  }
});

AppointmentSchema.virtual('formattedDate').get(function() {
  return this.appointmentDate ? this.appointmentDate.toLocaleDateString('ar-SA') : '';
});

AppointmentSchema.virtual('isPast').get(function() {
  if (!this.appointmentDate) return false;
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  
  if (this.appointmentTime) {
    const [hours, minutes] = this.appointmentTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
  }
  
  return appointmentDateTime < now;
});

AppointmentSchema.virtual('isUpcoming').get(function() {
  if (!this.appointmentDate) return false;
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  
  if (this.appointmentTime) {
    const [hours, minutes] = this.appointmentTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
  }
  
  return appointmentDateTime >= now;
});

AppointmentSchema.set('toJSON', { virtuals: true });
AppointmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Appointment", AppointmentSchema);