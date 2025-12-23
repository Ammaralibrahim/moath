const app = require('./app');
require('./config/database');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor.`);
  console.log(`📊 API URL: http://localhost:${PORT}`);
  console.log(`🔑 Admin Key: ${process.env.ADMIN_API_KEY || "admin123"}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  
  // Create emergency backup
  try {
    const { createEmergencyBackup } = require('./services/backupService');
    await createEmergencyBackup("shutdown");
  } catch (error) {
    console.error("Failed to create emergency backup:", error);
  }

  await require('mongoose').connection.close();
  console.log("MongoDB connection closed");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});