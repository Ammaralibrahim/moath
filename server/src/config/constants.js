module.exports = {
  CORS_ORIGINS: ['https://alsawaf.vercel.app', 'http://localhost:3000'],
  BACKUP_DIR: "backups",
  ADMIN_KEY: process.env.ADMIN_API_KEY || "admin123",
  PORT: process.env.PORT || 5000
};