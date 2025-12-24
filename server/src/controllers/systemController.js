const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
exports.healthCheck = async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    const patientCount = await Patient.countDocuments();
    const appointmentCount = await Appointment.countDocuments();

    res.json({
      success: true,
      message: "API çalışıyor",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      stats: {
        patients: patientCount,
        appointments: appointmentCount,
      },
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
    });
  }
};

exports.getSystemInfo = async (req, res) => {
  try {
    const stats = await mongoose.connection.db.stats();

    res.json({
      success: true,
      data: {
        database: {
          name: stats.db,
          collections: stats.collections,
          objects: stats.objects,
          avgObjSize: stats.avgObjSize,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes,
          indexSize: stats.indexSize,
        },
        server: {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
        },
      },
    });
  } catch (error) {
    console.error("Error getting system info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get system info",
    });
  }
};