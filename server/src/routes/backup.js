const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backupController");

// Backup yönetimi
router.post("/", backupController.createBackup);
router.get("/", backupController.listBackups);
router.get("/stats", backupController.getBackupStats);
router.get("/:id/download", backupController.downloadBackup);
router.post("/:id/restore", backupController.restoreBackup);
router.delete("/:id", backupController.deleteBackup);

module.exports = router;