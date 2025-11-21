const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-key', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/poliklinik';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB bağlantısı başarılı');
})
.catch((error) => {
  console.error('MongoDB bağlantı hatası:', error);
  process.exit(1);
});

// Enhanced Appointment Schema with better validation
const AppointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, 'Hasta adı soyadı gereklidir'],
    trim: true,
    minlength: [2, 'Hasta adı en az 2 karakter olmalıdır'],
    maxlength: [100, 'Hasta adı en fazla 100 karakter olmalıdır']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Telefon numarası gereklidir'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9+\-\s()]{10,20}$/.test(v);
      },
      message: 'Geçerli bir telefon numarası giriniz'
    }
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Randevu tarihi gereklidir'],
    validate: {
      validator: function(v) {
        return v >= new Date().setHours(0,0,0,0);
      },
      message: 'Randevu tarihi geçmiş bir tarih olamaz'
    }
  },
  appointmentTime: {
    type: String,
    required: [true, 'Randevu saati gereklidir'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat formatı giriniz (HH:MM)']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notlar en fazla 500 karakter olabilir'],
    default: ''
  },
  status: {
    type: String,
    default: 'pending',
    enum: {
      values: ['pending', 'confirmed', 'cancelled'],
      message: 'Geçersiz durum değeri'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Remove unique index to prevent conflicts, handle duplicates in application logic
AppointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });

AppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

// Enhanced Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY || 'admin123';
  
  console.log('Admin Auth Check:', { 
    received: adminKey, 
    expected: expectedKey,
    match: adminKey === expectedKey 
  });
  
  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح بالوصول - تحقق من مفتاح المصادقة'
    });
  }
  next();
};

// Health check with better response
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API çalışıyor', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// PUBLIC ENDPOINTS - Randevu oluşturma ve müsaitlik kontrolü

// Create new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { patientName, phoneNumber, appointmentDate, appointmentTime, notes } = req.body;

    // Validate required fields
    if (!patientName || !phoneNumber || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول المطلوبة يجب ملؤها'
      });
    }

    // Check if the appointment date is in the future
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime < new Date().setHours(0,0,0,0)) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حجز موعد في تاريخ مضى'
      });
    }

    // Check for duplicate appointment (same date and time)
    const existingAppointment = await Appointment.findOne({
      appointmentDate: appointmentDateTime,
      appointmentTime: appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'هذا الموعد محجوز مسبقاً. يرجى اختيار وقت آخر.'
      });
    }

    // Create new appointment
    const appointment = new Appointment({
      patientName,
      phoneNumber,
      appointmentDate: appointmentDateTime,
      appointmentTime,
      notes: notes || '',
      status: 'pending'
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'تم حجز الموعد بنجاح',
      data: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'خطأ في التحقق من البيانات',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'فشل في حجز الموعد'
    });
  }
});

// Get available dates for the next 60 days
app.get('/api/available-dates', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setDate(today.getDate() + 60);
    
    const dates = [];
    const currentDate = new Date(today);
    
    // Get all appointments for the next 60 days
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: today,
        $lte: endDate
      },
      status: { $in: ['pending', 'confirmed'] }
    });
    
    // Group appointments by date
    const appointmentsByDate = {};
    appointments.forEach(apt => {
      const dateStr = apt.appointmentDate.toISOString().split('T')[0];
      if (!appointmentsByDate[dateStr]) {
        appointmentsByDate[dateStr] = [];
      }
      appointmentsByDate[dateStr].push(apt.appointmentTime);
    });
    
    // Generate available dates
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      
      // Exclude Fridays (5) and Saturdays (6) - Weekend in Arab countries
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        const bookedSlots = appointmentsByDate[dateStr] || [];
        const availableSlotsCount = 16 - bookedSlots.length; // 16 available slots per day
        
        dates.push({
          date: dateStr,
          available: availableSlotsCount > 0,
          availableSlots: Math.max(0, availableSlotsCount)
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.json({
      success: true,
      data: dates
    });
  } catch (error) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب التواريخ المتاحة'
    });
  }
});

// Get available time slots for a specific date
app.get('/api/available-slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'تاريخ مطلوب'
      });
    }
    
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Get all appointments for the selected date
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: selectedDate,
        $lt: nextDate
      },
      status: { $in: ['pending', 'confirmed'] }
    });
    
    const bookedSlots = appointments.map(apt => apt.appointmentTime);
    
    // Define available time slots (9:00 to 16:30 with 30-minute intervals)
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30'
    ];
    
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    
    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الأوقات المتاحة'
    });
  }
});

// ADMIN ENDPOINTS

// Get all appointments with filtering
app.get('/api/admin/appointments', authenticateAdmin, async (req, res) => {
  try {
    const { date, status, patientName, phoneNumber } = req.query;
    let query = {};

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.appointmentDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    if (status) {
      query.status = status;
    }

    if (patientName) {
      query.patientName = { $regex: patientName, $options: 'i' };
    }

    if (phoneNumber) {
      query.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: appointments || [],
      count: appointments.length
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب المواعيد',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get statistics
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const total = await Appointment.countDocuments();
    const pending = await Appointment.countDocuments({ status: 'pending' });
    const confirmed = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelled = await Appointment.countDocuments({ status: 'cancelled' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCount = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyCount = await Appointment.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const monthlyCount = await Appointment.countDocuments({
      createdAt: { $gte: monthStart, $lt: monthEnd }
    });

    res.json({
      success: true,
      data: {
        total,
        pending,
        confirmed,
        cancelled,
        today: todayCount,
        weekly: weeklyCount,
        monthly: monthlyCount
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الإحصائيات'
    });
  }
});

// Get analytics data
app.get('/api/admin/analytics', authenticateAdmin, async (req, res) => {
  try {
    // Basic analytics data
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await Appointment.countDocuments({
        appointmentDate: { $gte: date, $lt: nextDate }
      });
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
                      '15:00', '15:30', '16:00', '16:30'];
    
    const hourlyDistribution = [];
    for (const time of timeSlots) {
      const count = await Appointment.countDocuments({ appointmentTime: time });
      hourlyDistribution.push({ time, count });
    }

    res.json({
      success: true,
      data: {
        dailyStats,
        hourlyDistribution,
        weeklyTrends: [],
        monthlyStats: []
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب التحليلات'
    });
  }
});

// Update appointment
app.put('/api/admin/appointments/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'حالة غير صالحة'
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث الموعد بنجاح',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث الموعد'
    });
  }
});

// Delete appointment
app.delete('/api/admin/appointments/:id', authenticateAdmin, async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!deletedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف الموعد بنجاح'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في حذف الموعد'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled Error:', error);
  res.status(500).json({
    success: false,
    message: 'حدث خطأ غير متوقع في الخادم'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint غير موجود'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Admin Key: ${process.env.ADMIN_API_KEY || 'admin123'}`);
});