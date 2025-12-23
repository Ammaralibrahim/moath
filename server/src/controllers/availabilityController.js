// controllers/availabilityController.js
const Appointment = require("../models/Appointment");

exports.getAvailableDates = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 60);

    // 60 günlük takvim oluştur
    const availableDates = [];
    const currentDate = new Date(today);

    while (currentDate <= maxDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();

      // Cuma gününü (5) ve geçmiş tarihleri hariç tut
      if (dayOfWeek !== 5) {
        // Bu tarihteki onaylı/pending randevuları say
        const appointmentCount = await Appointment.countDocuments({
          appointmentDate: {
            $gte: new Date(dateStr),
            $lt: new Date(new Date(dateStr).setDate(new Date(dateStr).getDate() + 1))
          },
          status: { $in: ['pending', 'confirmed'] }
        });

        const maxSlotsPerDay = 11; // 08:00 - 18:00 arası saatlik (11 saat)
        const available = appointmentCount < maxSlotsPerDay;
        const availableSlots = Math.max(0, maxSlotsPerDay - appointmentCount);

        availableDates.push({
          date: dateStr,
          available: available,
          availableSlots: availableSlots,
          totalSlots: maxSlotsPerDay,
          bookedSlots: appointmentCount
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      success: true,
      data: availableDates
    });
  } catch (error) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب التواريخ المتاحة'
    });
  }
};

exports.getAvailableSlots = async (req, res) => {
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

    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + 1);

    // Bu tarihteki mevcut randevuları al
    const existingAppointments = await Appointment.find({
      appointmentDate: {
        $gte: selectedDate,
        $lt: endDate
      },
      status: { $in: ['pending', 'confirmed'] }
    }).select('appointmentTime patientName');

    const bookedSlots = existingAppointments.map(app => ({
      time: app.appointmentTime,
      patientName: app.patientName
    }));

    // Tüm olası saatler (08:00 - 18:00 arası, saatlik)
    const allTimeSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      allTimeSlots.push(time);
    }

    // Boş saatleri filtrele
    const availableSlots = allTimeSlots.filter(slot => 
      !bookedSlots.some(booked => booked.time === slot)
    );

    res.json({
      success: true,
      data: availableSlots,
      bookedSlots: bookedSlots,
      totalSlots: allTimeSlots.length,
      availableCount: availableSlots.length
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الأوقات المتاحة'
    });
  }
};

exports.checkSlotAvailability = async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'التاريخ والوقت مطلوبان'
      });
    }

    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    const existingAppointment = await Appointment.findOne({
      appointmentDate: appointmentDate,
      appointmentTime: time,
      status: { $in: ['pending', 'confirmed'] }
    });

    res.json({
      success: true,
      data: {
        available: !existingAppointment,
        slotTime: time,
        slotDate: date
      }
    });
  } catch (error) {
    console.error('Error checking slot availability:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في التحقق من توافر الوقت'
    });
  }
};