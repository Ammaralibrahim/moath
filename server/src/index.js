const app = require("./app");
const mongoose = require("mongoose");
const { createAutomaticBackup } = require("./controllers/backupController");
const Backup = require("./models/Backup");
const fs = require("fs").promises;
const path = require("path");

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (error) => {
  console.error("❌ MongoDB bağlantı hatası:", error);
});

db.once("open", async () => {
  console.log("✅ MongoDB'ye bağlanıldı");

  const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`✅ Backup dizini: ${BACKUP_DIR}`);
  }

  const scheduleBackup = async () => {
    try {
      const lastBackup = await Backup.findOne({
        type: "automatic",
        status: "success"
      }).sort({ createdAt: -1 });

      const now = new Date();
      const backupInterval = 24 * 60 * 60 * 1000;

      if (!lastBackup || (now - new Date(lastBackup.createdAt)) > backupInterval) {
        console.log("🔄 Otomatik backup başlatılıyor...");
        await createAutomaticBackup();
      }
    } catch (error) {
      console.error("❌ Otomatik backup hatası:", error);
    }
  };

  setInterval(scheduleBackup, 60 * 60 * 1000);
  setTimeout(scheduleBackup, 5000);

  app.listen(PORT, () => {
    console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
  });
});
