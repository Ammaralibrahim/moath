const Backup = require("../models/Backup");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");

// Backup dizini - src klasörünün dışında root dizininde olsun
const BACKUP_DIR = path.join(__dirname, "../../backups");
const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || 
  crypto.randomBytes(32).toString("hex"); // Otomatik 32 karakter hex key

// Backup dizinini oluştur
const ensureBackupDir = async () => {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`✅ Backup dizini oluşturuldu: ${BACKUP_DIR}`);
  }
};

// İlk çalıştırmada dizini oluştur
ensureBackupDir();

// Şifreleme fonksiyonları
function encrypt(text) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", 
      Buffer.from(ENCRYPTION_KEY.length === 64 ? ENCRYPTION_KEY : 
        crypto.createHash('sha256').update(ENCRYPTION_KEY).digest('hex'), 
        "hex"), 
      iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();
    return {
      iv: iv.toString("hex"),
      encryptedData: encrypted,
      authTag: authTag.toString("hex")
    };
  } catch (error) {
    console.error("Şifreleme hatası:", error);
    throw error;
  }
}

function decrypt(encrypted) {
  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY.length === 64 ? ENCRYPTION_KEY : 
        crypto.createHash('sha256').update(ENCRYPTION_KEY).digest('hex'), 
        "hex"),
      Buffer.from(encrypted.iv, "hex")
    );
    decipher.setAuthTag(Buffer.from(encrypted.authTag, "hex"));
    let decrypted = decipher.update(encrypted.encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Şifre çözme hatası:", error);
    throw error;
  }
}

// Backup oluştur
exports.createBackup = async (req, res) => {
  let backupRecord;
  try {
    const { type = "full", schedule } = req.body;

    if (!["full", "patients", "appointments"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "نوع النسخ الاحتياطي غير صالح"
      });
    }

    // Dizin kontrolü
    await ensureBackupDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${type}-backup-${timestamp}.json.enc`;
    const filePath = path.join(BACKUP_DIR, filename);

    backupRecord = new Backup({
      filename,
      path: filePath,
      size: 0,
      type,
      status: "pending",
      metadata: {}
    });

    await backupRecord.save();
    console.log(`🔄 Backup başlatıldı: ${filename}`);

    // Verileri topla
    let backupData = {};
    
    if (type === "full" || type === "patients") {
      const patients = await Patient.find().lean();
      backupData.patients = patients;
      backupRecord.metadata.patients = patients.length;
      console.log(`📊 ${patients.length} hasta verisi toplandı`);
    }
    
    if (type === "full" || type === "appointments") {
      const appointments = await Appointment.find()
        .populate("patientId", "patientName phoneNumber")
        .lean();
      backupData.appointments = appointments;
      backupRecord.metadata.appointments = appointments.length;
      console.log(`📊 ${appointments.length} randevu verisi toplandı`);
    }

    // Meta veri ekle
    backupData.metadata = {
      createdAt: new Date(),
      type,
      database: mongoose.connection.name,
      version: "1.0",
      totalRecords: (backupData.patients?.length || 0) + (backupData.appointments?.length || 0)
    };

    // JSON'a çevir, sıkıştır ve şifrele
    const jsonData = JSON.stringify(backupData, null, 2);
    console.log(`📝 JSON verisi hazırlandı (${jsonData.length} karakter)`);
    
    const compressed = zlib.gzipSync(jsonData);
    console.log(`🗜️ Veri sıkıştırıldı (${compressed.length} bayt)`);
    
    const encrypted = encrypt(compressed.toString("base64"));
    console.log(`🔐 Veri şifrelendi`);

    await fs.writeFile(filePath, JSON.stringify(encrypted));
    console.log(`💾 Dosya kaydedildi: ${filePath}`);

    const stats = await fs.stat(filePath);
    backupRecord.size = stats.size;
    backupRecord.status = "success";
    backupRecord.metadata.database = mongoose.connection.name;
    backupRecord.metadata.version = "1.0";
    
    if (schedule === "daily") {
      backupRecord.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün
    } else if (schedule === "weekly") {
      backupRecord.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 gün
    } else if (schedule === "monthly") {
      backupRecord.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 yıl
    }

    await backupRecord.save();
    console.log(`✅ Backup başarıyla oluşturuldu: ${filename} (${stats.size} bayt)`);

    res.status(201).json({
      success: true,
      message: "تم إنشاء النسخ الاحتياطي بنجاح",
      data: backupRecord
    });

  } catch (error) {
    console.error("Backup creation error:", error);
    
    if (backupRecord) {
      try {
        backupRecord.status = "failed";
        backupRecord.metadata.error = error.message;
        await backupRecord.save();
      } catch (saveError) {
        console.error("Backup kaydı güncellenirken hata:", saveError);
      }
    }

    res.status(500).json({
      success: false,
      message: "فشل في إنشاء النسخ الاحتياطي",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Backup listele
exports.listBackups = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const backups = await Backup.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v -path");

    const total = await Backup.countDocuments(query);

    res.json({
      success: true,
      data: backups,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Backup list error:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب النسخ الاحتياطية"
    });
  }
};

// Backup indir
exports.downloadBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);
    
    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "النسخ الاحتياطي غير موجود"
      });
    }

    // Path kontrolü
    if (!backup.path) {
      return res.status(404).json({
        success: false,
        message: "مسار النسخ الاحتياطي غير موجود"
      });
    }

    try {
      await fs.access(backup.path);
    } catch {
      return res.status(404).json({
        success: false,
        message: "ملف النسخ الاحتياطي غير موجود"
      });
    }

    const encryptedData = JSON.parse(await fs.readFile(backup.path, "utf8"));
    const decryptedBase64 = decrypt(encryptedData);
    const decompressed = zlib.gunzipSync(Buffer.from(decryptedBase64, "base64"));

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${backup.filename.replace('.enc', '.json')}"`);
    res.send(decompressed);
  } catch (error) {
    console.error("Backup download error:", error);
    res.status(500).json({
      success: false,
      message: "فشل في تحميل النسخ الاحتياطي"
    });
  }
};

// Backup geri yükle
exports.restoreBackup = async (req, res) => {
  let session;
  try {
    const { id } = req.params;
    const { mode = "preview" } = req.body; // preview or restore

    const backup = await Backup.findById(id);
    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "النسخ الاحتياطي غير موجود"
      });
    }

    // Path kontrolü
    if (!backup.path) {
      return res.status(404).json({
        success: false,
        message: "مسار النسخ الاحتياطي غير موجود"
      });
    }

    const encryptedData = JSON.parse(await fs.readFile(backup.path, "utf8"));
    const decryptedBase64 = decrypt(encryptedData);
    const decompressed = zlib.gunzipSync(Buffer.from(decryptedBase64, "base64"));
    const backupData = JSON.parse(decompressed);

    if (mode === "preview") {
      return res.json({
        success: true,
        message: "معاينة النسخ الاحتياطي",
        data: {
          type: backup.type,
          metadata: backupData.metadata,
          stats: {
            patients: backupData.patients?.length || 0,
            appointments: backupData.appointments?.length || 0,
            total: backupData.metadata.totalRecords
          },
          sample: {
            patients: backupData.patients?.slice(0, 3) || [],
            appointments: backupData.appointments?.slice(0, 3) || []
          }
        }
      });
    }

    // Geri yükleme işlemi
    session = await mongoose.startSession();
    session.startTransaction();

    console.log(`🔄 ${backup.type} backup geri yükleniyor...`);

    if (backup.type === "full" || backup.type === "patients") {
      await Patient.deleteMany({}).session(session);
      if (backupData.patients?.length > 0) {
        console.log(`📥 ${backupData.patients.length} hasta yükleniyor...`);
        await Patient.insertMany(backupData.patients, { session });
      }
    }

    if (backup.type === "full" || backup.type === "appointments") {
      await Appointment.deleteMany({}).session(session);
      if (backupData.appointments?.length > 0) {
        console.log(`📥 ${backupData.appointments.length} randevu yükleniyor...`);
        await Appointment.insertMany(backupData.appointments, { session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    backup.status = "restored";
    await backup.save();

    console.log(`✅ Backup geri yüklendi: ${backup.filename}`);

    res.json({
      success: true,
      message: "تم استعادة النسخ الاحتياطي بنجاح",
      data: {
        patients: backupData.patients?.length || 0,
        appointments: backupData.appointments?.length || 0
      }
    });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    
    console.error("Backup restore error:", error);
    res.status(500).json({
      success: false,
      message: "فشل في استعادة النسخ الاحتياطي"
    });
  }
};

// Backup sil
exports.deleteBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);
    
    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "النسخ الاحتياطي غير موجود"
      });
    }

    console.log(`🗑️ Backup siliniyor: ${backup.filename}`);
    
    // Eğer path varsa ve dosya mevcutsa sil
    if (backup.path) {
      try {
        await fs.access(backup.path);
        await fs.unlink(backup.path);
        console.log(`✅ Dosya silindi: ${backup.path}`);
      } catch (fileError) {
        // Dosya zaten yoksa veya başka bir hata varsa
        console.warn(`⚠️ Dosya silinemedi (${backup.path}):`, fileError.message);
        // Devam et, sadece veritabanı kaydını sil
      }
    }

    await backup.deleteOne();
    console.log(`✅ Veritabanı kaydı silindi: ${backup._id}`);

    res.json({
      success: true,
      message: "تم حذف النسخ الاحتياطي بنجاح"
    });
  } catch (error) {
    console.error("Backup delete error:", error);
    res.status(500).json({
      success: false,
      message: "فشل في حذف النسخ الاحتياطي"
    });
  }
};

// İstatistikler
exports.getBackupStats = async (req, res) => {
  try {
    const totalBackups = await Backup.countDocuments();
    const successfulBackups = await Backup.countDocuments({ status: "success" });
    const totalSize = await Backup.aggregate([
      { $match: { size: { $exists: true, $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$size" } } }
    ]);
    
    const typeStats = await Backup.aggregate([
      { $group: { 
        _id: "$type", 
        count: { $sum: 1 }, 
        totalSize: { $sum: "$size" } 
      } }
    ]);

    const recentBackups = await Backup.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("filename type status createdAt size");

    res.json({
      success: true,
      data: {
        total: totalBackups,
        successful: successfulBackups,
        totalSize: totalSize[0]?.total || 0,
        typeStats,
        recent: recentBackups
      }
    });
  } catch (error) {
    console.error("Backup stats error:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب إحصائيات النسخ الاحتياطي"
    });
  }
};

// Otomatik backup
exports.createAutomaticBackup = async () => {
  try {
    await ensureBackupDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `auto-backup-${timestamp}.json.enc`;
    const filePath = path.join(BACKUP_DIR, filename);

    console.log(`🔄 Otomatik backup başlatıldı: ${filename}`);

    const patients = await Patient.find().lean();
    const appointments = await Appointment.find()
      .populate("patientId", "patientName phoneNumber")
      .lean();

    const backupData = {
      patients,
      appointments,
      metadata: {
        createdAt: new Date(),
        type: "automatic",
        database: mongoose.connection.name,
        version: "1.0",
        totalRecords: patients.length + appointments.length
      }
    };

    const jsonData = JSON.stringify(backupData, null, 2);
    const compressed = zlib.gzipSync(jsonData);
    const encrypted = encrypt(compressed.toString("base64"));

    await fs.writeFile(filePath, JSON.stringify(encrypted));

    const stats = await fs.stat(filePath);

    const backupRecord = new Backup({
      filename,
      path: filePath,
      size: stats.size,
      type: "automatic",
      status: "success",
      metadata: {
        patients: patients.length,
        appointments: appointments.length,
        database: mongoose.connection.name,
        version: "1.0"
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün
    });

    await backupRecord.save();
    console.log(`✅ Otomatik backup oluşturuldu: ${filename} (${stats.size} bayt)`);
    return backupRecord;
  } catch (error) {
    console.error("Automatic backup error:", error);
    throw error;
  }
};