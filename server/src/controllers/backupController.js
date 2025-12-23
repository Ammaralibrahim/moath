const Backup = require("../models/Backup");
const backupService = require("../services/backupService");
const fs = require("fs").promises;
const path = require("path");

exports.createBackup = async (req, res) => {
  try {
    const { type = "full", includeMetadata = true } = req.body;
    const result = await backupService.createBackup(type, includeMetadata);

    res.json({
      success: true,
      message: "تم إنشاء النسخة الاحتياطية بنجاح",
      data: result,
    });
  } catch (error) {
    console.error("Error creating backup:", error);

    // Log failed backup attempt
    const backup = new Backup({
      filename: `failed-backup-${Date.now()}`,
      size: 0,
      recordCount: 0,
      type: req.body.type || "full",
      status: "failed",
      metadata: { error: error.message },
    });
    await backup.save();

    res.status(500).json({
      success: false,
      message: "فشل في إنشاء النسخة الاحتياطية",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.downloadBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "النسخة الاحتياطية غير موجودة",
      });
    }

    const filepath = path.join(backupService.backupDir, backup.filename);

    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "ملف النسخة الاحتياطية غير موجود",
      });
    }

    // Update download count
    backup.downloadCount += 1;
    await backup.save();

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${backup.filename}"`
    );
    res.sendFile(filepath);
  } catch (error) {
    console.error("Error downloading backup:", error);
    res.status(500).json({
      success: false,
      message: "فشل في تحميل النسخة الاحتياطية",
    });
  }
};

exports.listBackups = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const backups = await Backup.find(query)
      .sort({ backupDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const total = await Backup.countDocuments(query);

    // Check if backup files still exist
    const backupsWithStatus = await Promise.all(
      backups.map(async (backup) => {
        const backupObj = backup.toObject();
        try {
          const filepath = path.join(backupService.backupDir, backup.filename);
          await fs.access(filepath);
          backupObj.fileExists = true;
        } catch {
          backupObj.fileExists = false;
        }
        return backupObj;
      })
    );

    res.json({
      success: true,
      data: backupsWithStatus,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error listing backups:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب قائمة النسخ الاحتياطية",
    });
  }
};

exports.restoreBackup = async (req, res) => {
  try {
    const result = await backupService.restoreBackup(
      req.params.id,
      req.query.clearExisting === "true"
    );

    res.json({
      success: true,
      message: `تم استعادة ${result.restoredCount} سجل بنجاح`,
      data: {
        restoredCount: result.restoredCount,
        restorationId: result.restorationId,
      },
    });
  } catch (error) {
    console.error("Error restoring backup:", error);

    // Log failed restoration
    const restorationRecord = new Backup({
      filename: `failed-restoration-${Date.now()}`,
      size: 0,
      recordCount: 0,
      type: "restoration",
      status: "failed",
      metadata: { error: error.message },
    });
    await restorationRecord.save();

    res.status(500).json({
      success: false,
      message: "فشل في استعادة النسخة الاحتياطية",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.deleteBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "النسخة الاحتياطية غير موجودة",
      });
    }

    // Delete file
    const filepath = path.join(backupService.backupDir, backup.filename);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.warn("Backup file not found, deleting record only:", error);
    }

    // Delete record
    await backup.deleteOne();

    res.json({
      success: true,
      message: "تم حذف النسخة الاحتياطية بنجاح",
    });
  } catch (error) {
    console.error("Error deleting backup:", error);
    res.status(500).json({
      success: false,
      message: "فشل في حذف النسخة الاحتياطية",
    });
  }
};

exports.getBackupStats = async (req, res) => {
  try {
    const stats = await backupService.getBackupStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting backup stats:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب إحصائيات النسخ الاحتياطي",
    });
  }
};