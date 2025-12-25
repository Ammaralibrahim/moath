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
    enum: ["success", "failed", "pending", "restored"],
    default: "pending"
  },
  metadata: {
    patients: { type: Number, default: 0 },
    appointments: { type: Number, default: 0 },
    database: { type: String },
    version: { type: String },
    error: { type: String }
  },
  expiresAt: {
    type: Date,
    index: { expires: 0 }
  },
  restoredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

BackupSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Backup", BackupSchema);