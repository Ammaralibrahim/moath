const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backupController");

// Admin key kontrol middleware
const verifyAdminKey = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const validKey = process.env.ADMIN_API_KEY || 'admin123';
  
  if (!adminKey || adminKey !== validKey) {
    return res.status(401).json({
      success: false,
      message: "غير مصرح بالوصول"
    });
  }
  next();
};

// Backup yönetimi
router.post("/", backupController.createBackup);
router.get("/", backupController.listBackups);
router.get("/stats", backupController.getBackupStats);
router.get("/:id/download", verifyAdminKey, backupController.downloadBackup);
router.post("/:id/restore", backupController.restoreBackup);
router.delete("/:id", backupController.deleteBackup);

module.exports = router;