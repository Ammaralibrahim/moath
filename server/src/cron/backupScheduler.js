// Cron scheduler disabled for serverless deployment
// This module intentionally does not start scheduled jobs automatically.
// If you need scheduled backups in production, use an external scheduler
// (e.g. Vercel Cron Jobs or other managed scheduler) that calls the
// backup endpoints on demand.

module.exports = {
  start: async () => {
    console.log('Backup scheduler is disabled in serverless mode');
  }
};