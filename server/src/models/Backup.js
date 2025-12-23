const mongoose = require("mongoose");

const BackupSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  recordCount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["full", "partial", "patients", "appointments", "restoration"],
    required: true,
  },
  status: {
    type: String,
    enum: ["success", "failed", "pending"],
    default: "pending",
  },
  backupDate: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
  metadata: {
    type: Object,
    default: {},
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
});

BackupSchema.index({ backupDate: -1 });
BackupSchema.index({ type: 1 });
BackupSchema.index({ status: 1 });
BackupSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("Backup", BackupSchema);