const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backupController");

router.post("/create", backupController.createBackup);
router.get("/download/:id", backupController.downloadBackup);
router.get("/list", backupController.listBackups);
router.post("/restore/:id", backupController.restoreBackup);
router.delete("/:id", backupController.deleteBackup);
router.get("/stats", backupController.getBackupStats);

module.exports = router;