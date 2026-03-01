module.exports = {
  CORS_ORIGINS: ['https://alsawafclient.vercel.app', 'http://localhost:3000'],
  ADMIN_KEY: process.env.ADMIN_API_KEY || "admin123",
  PORT: process.env.PORT || 5000
};