const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backupController");

const verifyAdminKey = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const validKey = process.env.ADMIN_API_KEY || 'admin123';
  
  if (!adminKey || adminKey !== validKey) {
    return res.status(401).json({
      success: false,
      message: "غير مصرح بالوصول - مفتاح إداري غير صحيح"
    });
  }
  next();
};

router.post("/", verifyAdminKey, backupController.createBackup);
router.get("/", backupController.listBackups);
router.get("/stats", backupController.getBackupStats);
router.get("/:id/preview", backupController.previewBackup);
router.get("/:id/download", verifyAdminKey, backupController.downloadBackup);
router.post("/:id/restore", verifyAdminKey, backupController.restoreBackup);
router.delete("/:id", verifyAdminKey, backupController.deleteBackup);

module.exports = router;