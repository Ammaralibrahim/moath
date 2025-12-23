const fs = require("fs").promises;
const path = require("path");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Backup = require("../models/Backup");

const backupDir = path.join(__dirname, "..", "..", "backups");

// Ensure backup directory exists
(async () => {
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (error) {
    console.error("Error creating backup directory:", error);
  }
})();

exports.backupDir = backupDir;

exports.createBackup = async (type = "full", includeMetadata = true) => {
  const timestamp = Date.now();
  const filename = `backup-${type}-${timestamp}.json`;
  const filepath = path.join(backupDir, filename);

  let backupData = {};
  const metadata = {
    timestamp,
    type,
    database: mongoose.connection.name,
    version: "1.0",
  };

  // Collect data based on type
  switch (type) {
    case "full":
      backupData.patients = await Patient.find().lean();
      backupData.appointments = await Appointment.find().lean();
      break;
    case "patients":
      backupData.patients = await Patient.find().lean();
      break;
    case "appointments":
      backupData.appointments = await Appointment.find().lean();
      break;
    default:
      throw new Error("نوع النسخ الاحتياطي غير معروف");
  }

  if (includeMetadata) {
    backupData.metadata = metadata;
    backupData.stats = {
      patients: backupData.patients ? backupData.patients.length : 0,
      appointments: backupData.appointments
        ? backupData.appointments.length
        : 0,
      backupDate: new Date().toISOString(),
    };
  }

  // Write to file
  const dataString = JSON.stringify(backupData, null, 2);
  await fs.writeFile(filepath, dataString, "utf8");

  const stats = await fs.stat(filepath);

  // Create backup record in database
  const backup = new Backup({
    filename,
    size: stats.size,
    recordCount:
      (backupData.patients?.length || 0) +
      (backupData.appointments?.length || 0),
    type,
    status: "success",
    metadata: {
      ...metadata,
      filepath,
    },
  });
  await backup.save();

  // Clean old backups (keep last 10)
  await cleanOldBackups();

  return {
    filename,
    size: stats.size,
    downloadUrl: `/api/backup/download/${backup._id}`,
    expiresAt: backup.expiresAt,
  };
};

exports.restoreBackup = async (backupId, clearExisting = false) => {
  const backup = await Backup.findById(backupId);

  if (!backup) {
    throw new Error("النسخة الاحتياطية غير موجودة");
  }

  const filepath = path.join(backupDir, backup.filename);
  const data = await fs.readFile(filepath, "utf8");
  const backupData = JSON.parse(data);

  // Start restoration process
  let restoredCount = 0;

  if (backupData.patients) {
    // Clear existing patients
    if (clearExisting) {
      await Patient.deleteMany({});
    }

    // Restore patients
    for (const patientData of backupData.patients) {
      // Remove _id to avoid duplicate key error
      const { _id, ...cleanData } = patientData;
      const patient = new Patient(cleanData);
      await patient.save();
      restoredCount++;
    }
  }

  if (backupData.appointments) {
    // Clear existing appointments
    if (clearExisting) {
      await Appointment.deleteMany({});
    }

    // Restore appointments
    for (const appointmentData of backupData.appointments) {
      const { _id, ...cleanData } = appointmentData;
      const appointment = new Appointment(cleanData);
      await appointment.save();
      restoredCount++;
    }
  }

  // Create restoration record
  const restorationRecord = new Backup({
    filename: `restoration-${backup.filename}`,
    size: backup.size,
    recordCount: restoredCount,
    type: "restoration",
    status: "success",
    metadata: {
      originalBackup: backup._id,
      restoredAt: new Date().toISOString(),
      clearExisting,
    },
  });
  await restorationRecord.save();

  return {
    restoredCount,
    restorationId: restorationRecord._id,
  };
};

exports.getBackupStats = async () => {
  const totalBackups = await Backup.countDocuments();
  const successfulBackups = await Backup.countDocuments({
    status: "success",
  });
  const totalSize = await Backup.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: null, total: { $sum: "$size" } } },
  ]);

  const recentBackups = await Backup.find({ status: "success" })
    .sort({ backupDate: -1 })
    .limit(5)
    .select("filename size backupDate type");

  const typeDistribution = await Backup.aggregate([
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);

  return {
    totalBackups,
    successfulBackups,
    totalSize: totalSize[0]?.total || 0,
    recentBackups,
    typeDistribution,
    backupDir,
  };
};

exports.createEmergencyBackup = async (reason = "emergency") => {
  const timestamp = Date.now();
  const filename = `emergency-backup-${timestamp}.json`;
  const filepath = path.join(backupDir, filename);

  const backupData = {
    patients: await Patient.find().lean(),
    appointments: await Appointment.find().lean(),
    metadata: {
      type: "emergency",
      timestamp,
      reason,
    },
  };

  await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));
  console.log(`Emergency backup created: ${filename}`);
  return filename;
};

async function cleanOldBackups() {
  const oldBackups = await Backup.find({
    status: "success",
    expiresAt: { $lt: new Date() },
  }).sort({ backupDate: 1 });

  for (const oldBackup of oldBackups.slice(
    0,
    Math.max(0, oldBackups.length - 10)
  )) {
    try {
      const oldFilepath = path.join(backupDir, oldBackup.filename);
      await fs.unlink(oldFilepath);
      await oldBackup.deleteOne();
    } catch (err) {
      console.error("Error deleting old backup:", err);
    }
  }
}