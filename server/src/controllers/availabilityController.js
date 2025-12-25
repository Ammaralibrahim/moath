const Appointment = require("../models/Appointment");

exports.getAvailableDates = async (req, res) => {
  try {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 60);
    
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: today,
        $lte: maxDate
      },
      status: { $in: ["pending", "confirmed"] }
    });
    
    // Generate dates for next 60 days excluding weekends
    const availableDates = [];
    const currentDate = new Date(today);
    
    while (currentDate <= maxDate) {
      const dayOfWeek = currentDate.getDay();
      
      // استبعاد الجمعة (5) والسبت (6)
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayAppointments = appointments.filter(
          app => app.appointmentDate.toISOString().split('T')[0] === dateStr
        );
        
        const bookedSlots = dayAppointments.length;
        const totalSlots = 11; // 8:00 - 18:00 with 1 hour slots
        const availableSlots = Math.max(0, totalSlots - bookedSlots);
        
        availableDates.push({
          date: dateStr,
          available: availableSlots > 0,
          availableSlots: availableSlots,
          totalSlots: totalSlots,
          bookedSlots: bookedSlots
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.json({
      success: true,
      data: availableDates
    });
  } catch (error) {
    console.error("Error fetching available dates:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب التواريخ المتاحة"
    });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "التاريخ مطلوب"
      });
    }
    
    // Check if date is weekend
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return res.json({
        success: true,
        data: [],
        message: "هذا اليوم عطلة رسمية"
      });
    }
    
    const appointments = await Appointment.find({
      appointmentDate: date,
      status: { $in: ["pending", "confirmed"] }
    });
    
    const bookedTimes = appointments.map(app => app.appointmentTime);
    
    // Generate all possible time slots
    const allTimeSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    // Filter available slots
    const availableSlots = allTimeSlots.filter(
      time => !bookedTimes.includes(time)
    );
    
    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب الأوقات المتاحة"
    });
  }
};

exports.checkSlotAvailability = async (req, res) => {
  try {
    const { date, time } = req.query;
    
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "التاريخ والوقت مطلوبان"
      });
    }
    
    // Check if date is weekend
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return res.json({
        success: true,
        data: { available: false },
        message: "لا يمكن حجز موعد في أيام العطلة"
      });
    }
    
    const appointment = await Appointment.findOne({
      appointmentDate: date,
      appointmentTime: time,
      status: { $in: ["pending", "confirmed"] }
    });
    
    res.json({
      success: true,
      data: {
        available: !appointment
      }
    });
  } catch (error) {
    console.error("Error checking slot availability:", error);
    res.status(500).json({
      success: false,
      message: "فشل في التحقق من توافر الوقت"
    });
  }
};