// services/backupScheduler.js
const cron = require('node-cron');
const backupController = require('../controllers/backupController');

class BackupScheduler {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) return;
    
    console.log('🚀 بدء جدولة النسخ الاحتياطي التلقائي...');
    
    // نسخ احتياطي يومي في 2:00 صباحًا
    this.scheduleJob('daily', '0 2 * * *', async () => {
      console.log('⏰ تشغيل النسخ الاحتياطي اليومي...');
      try {
        await backupController.createAutomaticBackup();
        console.log('✅ اكتمل النسخ الاحتياطي اليومي');
      } catch (error) {
        console.error('❌ فشل النسخ الاحتياطي اليومي:', error);
      }
    });

    // نسخ احتياطي أسبوعي يوم الإثنين في 3:00 صباحًا
    this.scheduleJob('weekly', '0 3 * * 1', async () => {
      console.log('⏰ تشغيل النسخ الاحتياطي الأسبوعي...');
      try {
        await backupController.createAutomaticBackup();
        console.log('✅ اكتمل النسخ الاحتياطي الأسبوعي');
      } catch (error) {
        console.error('❌ فشل النسخ الاحتياطي الأسبوعي:', error);
      }
    });

    // نسخ احتياطي شهري في أول يوم من الشهر في 4:00 صباحًا
    this.scheduleJob('monthly', '0 4 1 * *', async () => {
      console.log('⏰ تشغيل النسخ الاحتياطي الشهري...');
      try {
        await backupController.createAutomaticBackup();
        console.log('✅ اكتمل النسخ الاحتياطي الشهري');
      } catch (error) {
        console.error('❌ فشل النسخ الاحتياطي الشهري:', error);
      }
    });

    // تنظيف النسخ القديمة يوميًا في 5:00 صباحًا
    this.scheduleJob('cleanup', '0 5 * * *', async () => {
      console.log('🧹 تنظيف النسخ الاحتياطية القديمة...');
      try {
        await this.cleanupOldBackups();
        console.log('✅ اكتمل تنظيف النسخ الاحتياطية');
      } catch (error) {
        console.error('❌ فشل تنظيف النسخ الاحتياطية:', error);
      }
    });

    this.isRunning = true;
    console.log('✅ تم بدء جميع المهام المجدولة');
  }

  scheduleJob(name, cronExpression, task) {
    const job = cron.schedule(cronExpression, task, {
      scheduled: true,
      timezone: "Asia/Riyadh"
    });
    
    this.jobs.set(name, job);
    console.log(`📅 تم جدولة مهمة ${name}: ${cronExpression}`);
  }

  async cleanupOldBackups() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const Backup = require('../models/Backup');
    const oldBackups = await Backup.find({
      createdAt: { $lt: thirtyDaysAgo },
      type: 'automatic'
    });

    for (const backup of oldBackups) {
      try {
        if (backup.path) {
          await fs.unlink(backup.path).catch(() => {});
        }
        await backup.deleteOne();
        console.log(`🗑️ تم حذف نسخة احتياطية قديمة: ${backup.filename}`);
      } catch (error) {
        console.error(`❌ خطأ في حذف ${backup.filename}:`, error);
      }
    }
  }

  stop() {
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`⏹️ توقفت مهمة ${name}`);
    }
    this.jobs.clear();
    this.isRunning = false;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: Array.from(this.jobs.keys()),
      nextRuns: Array.from(this.jobs.entries()).map(([name, job]) => ({
        name,
        next: job.nextDate().toISOString()
      }))
    };
  }
}

module.exports = new BackupScheduler();