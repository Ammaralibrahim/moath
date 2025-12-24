const cron = require("node-cron");
const backupController = require("../controllers/backupController");
const fs = require("fs").promises;
const path = require("path");

// Backup dizinini oluştur
const ensureBackupDir = async () => {
  const BACKUP_DIR = path.join(__dirname, "../backups");
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`✅ Backup dizini oluşturuldu: ${BACKUP_DIR}`);
  }
};

// Her gece 02:00'de otomatik backup
cron.schedule("0 2 * * *", async () => {
  console.log("🔄 Running automatic backup...");
  try {
    await ensureBackupDir();
    await backupController.createAutomaticBackup();
    console.log("✅ Automatic backup completed");
  } catch (error) {
    console.error("❌ Automatic backup failed:", error.message);
  }
});

// Her Pazar 03:00'de haftalık backup temizleme
cron.schedule("0 3 * * 0", async () => {
  const Backup = require("../models/Backup");
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  try {
    const oldBackups = await Backup.find({
      type: "automatic",
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    let deletedCount = 0;
    for (const backup of oldBackups) {
      try {
        // Path kontrolü
        if (backup.path) {
          try {
            await fs.access(backup.path);
            await fs.unlink(backup.path);
          } catch (fileError) {
            console.warn(`Could not delete file: ${backup.path}`, fileError.message);
          }
        }
        await backup.deleteOne();
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting backup ${backup._id}:`, error.message);
      }
    }
    
    console.log(`🧹 Cleaned ${deletedCount} old backups`);
  } catch (error) {
    console.error("Cleanup error:", error.message);
  }
});

console.log("📅 Backup scheduler initialized");