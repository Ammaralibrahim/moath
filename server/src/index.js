const app = require("./app");
const { connect } = require("./config/database");

// Vercel serverless handler
// Ensure DB is connected lazily and reused across invocations.
module.exports = async (req, res) => {
  try {
    await connect();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    res.statusCode = 500;
    return res.end('Database connection error');
  }

  // Delegate to Express app
  return app(req, res);
};