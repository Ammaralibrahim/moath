const mongoose = require("mongoose");

const BackupSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    unique: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ["full", "patients", "appointments", "automatic"],
    required: true
  },
  status: {
    type: String,
    enum: ["success", "failed", "pending"],
    default: "pending"
  },
  metadata: {
    patients: { type: Number, default: 0 },
    appointments: { type: Number, default: 0 },
    database: { type: String },
    version: { type: String }
  },
  expiresAt: {
    type: Date,
    index: { expires: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Backup", BackupSchema);