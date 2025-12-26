const mongoose = require('mongoose');
require('dotenv').config();

const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

async function migrateOriginalIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🏗️  Migration başlıyor...');
    
    // Hastaları güncelle
    const patients = await Patient.find({ originalId: { $exists: false } });
    console.log(`📊 ${patients.length} hasta güncellenecek`);
    
    for (const patient of patients) {
      patient.originalId = patient._id.toString();
      await patient.save();
    }
    
    // Randevuları güncelle
    const appointments = await Appointment.find({ originalId: { $exists: false } });
    console.log(`📅 ${appointments.length} randevu güncellenecek`);
    
    for (const appointment of appointments) {
      appointment.originalId = appointment._id.toString();
      await appointment.save();
    }
    
    console.log('✅ Migration tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration hatası:', error);
    process.exit(1);
  }
}

migrateOriginalIds();