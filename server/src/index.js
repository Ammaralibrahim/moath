const mongoose = require("mongoose");
const app = require("../app");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
