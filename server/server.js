const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/poliklinik', {
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

// Randevu modeli
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

// Tarih ve saat kombinasyonu için unique index
AppointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 }, { 
  unique: true,
  partialFilterExpression: { status: { $ne: 'cancelled' } }
});

AppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

// API Routes

// Sağlık kontrolü
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API çalışıyor', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Müsait tarihleri getirme
app.get('/api/available-dates', async (req, res) => {
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 60); // 60 gün ileri

    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      // Hafta sonları hariç
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // O günkü randevuları say
        const startOfDay = new Date(dateStr);
        const endOfDay = new Date(dateStr);
        endOfDay.setDate(endOfDay.getDate() + 1);
        
        const appointmentCount = await Appointment.countDocuments({
          appointmentDate: {
            $gte: startOfDay,
            $lt: endOfDay
          },
          status: { $ne: 'cancelled' }
        });
        
        // Toplam müsait slot sayısı (09:00-14:30 arası 30 dakikalık aralıklarla)
        const totalSlots = 12; // 9:00, 9:30, 10:00, ..., 14:00
        const availableSlots = Math.max(0, totalSlots - appointmentCount);
        
        dates.push({
          date: dateStr,
          available: availableSlots > 0,
          availableSlots: availableSlots,
          appointmentCount: appointmentCount
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.json({
      success: true,
      data: dates
    });
    
  } catch (error) {
    console.error('Müsait tarihler getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Müsait tarihler getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Randevu oluşturma
app.post('/api/appointments', async (req, res) => {
  try {
    console.log('Gelen randevu verisi:', req.body);
    
    const { patientName, phoneNumber, appointmentDate, appointmentTime, notes } = req.body;
    
    // Gerekli alanları kontrol et
    if (!patientName || !phoneNumber || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Tüm gerekli alanları doldurunuz: patientName, phoneNumber, appointmentDate, appointmentTime'
      });
    }

    // Tarih formatını kontrol et
    const appointmentDateObj = new Date(appointmentDate);
    if (isNaN(appointmentDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz tarih formatı'
      });
    }

    // Geçmiş tarih kontrolü
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDateObj < today) {
      return res.status(400).json({
        success: false,
        message: 'Geçmiş bir tarih için randevu oluşturulamaz'
      });
    }

    // Hafta sonu kontrolü
    const dayOfWeek = appointmentDateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json({
        success: false,
        message: 'Hafta sonları randevu alınamaz'
      });
    }

    // Çalışma saatleri kontrolü
    const timeParts = appointmentTime.split(':');
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);
    
    if (hour < 9 || hour > 14 || (hour === 14 && minute > 0)) {
      return res.status(400).json({
        success: false,
        message: 'Çalışma saatleri dışında randevu alınamaz (09:00 - 14:00)'
      });
    }

    // Aynı saatte başka randevu var mı kontrol et
    const existingAppointment = await Appointment.findOne({
      appointmentDate: appointmentDateObj,
      appointmentTime,
      status: { $ne: 'cancelled' }
    });
    
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Bu saat için zaten randevu bulunmaktadır.'
      });
    }
    
    const appointment = new Appointment({
      patientName: patientName.trim(),
      phoneNumber: phoneNumber.trim(),
      appointmentDate: appointmentDateObj,
      appointmentTime,
      notes: notes ? notes.trim() : ''
    });
    
    const savedAppointment = await appointment.save();
    console.log('Randevu başarıyla kaydedildi:', savedAppointment._id);
    
    res.status(201).json({
      success: true,
      message: 'Randevunuz başarıyla oluşturuldu.',
      data: {
        id: savedAppointment._id,
        patientName: savedAppointment.patientName,
        phoneNumber: savedAppointment.phoneNumber,
        appointmentDate: savedAppointment.appointmentDate,
        appointmentTime: savedAppointment.appointmentTime,
        notes: savedAppointment.notes,
        status: savedAppointment.status
      }
    });
    
  } catch (error) {
    console.error('Randevu oluşturma hatası:', error);
    
    // MongoDB validation hataları
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors
      });
    }
    
    // Duplicate key hatası
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu tarih ve saat için zaten randevu bulunmaktadır.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Randevu oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Mevcut saatleri getirme
app.get('/api/available-slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Tarih parametresi gereklidir.'
      });
    }
    
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz tarih formatı'
      });
    }
    
    const dayOfWeek = appointmentDate.getDay();
    
    // Hafta sonları randevu yok
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Sabah 9'dan öğlen 2'ye kadar 30 dakikalık aralıklarla saatler
    const allSlots = [];
    for (let hour = 9; hour < 15; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 14 && minute === 30) break;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        allSlots.push(timeString);
      }
    }
    
    // Dolu saatleri bul
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const existingAppointments = await Appointment.find({
      appointmentDate: {
        $gte: startDate,
        $lt: endDate
      },
      status: { $ne: 'cancelled' }
    });
    
    const bookedSlots = existingAppointments.map(apt => apt.appointmentTime);
    
    // Mevcut saatleri filtrele
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    
    res.json({
      success: true,
      data: availableSlots,
      date: date,
      totalSlots: allSlots.length,
      availableCount: availableSlots.length,
      bookedCount: bookedSlots.length
    });
  } catch (error) {
    console.error('Mevcut saatleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Mevcut saatler getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Randevuları listeleme (admin için)
app.get('/api/appointments', async (req, res) => {
  try {
    const { date, status } = req.query;
    let query = {};
    
    if (date) {
      const startDate = new Date(date);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz tarih formatı'
        });
      }
      
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
    
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Randevuları listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Randevular getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint bulunamadı'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
  console.log(`Çevre: ${process.env.NODE_ENV || 'development'}`);
});