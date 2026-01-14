const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/poliklinik";

let cached = global.__mongooseCached || null;

async function connect() {
  if (cached && cached.isConnected) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in environment');
  }

  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 30000,
    retryWrites: true,
    retryReads: true,
    w: 'majority'
  };

  const conn = await mongoose.connect(MONGODB_URI, opts);

  cached = {
    conn: mongoose,
    isConnected: mongoose.connection.readyState === 1
  };

  global.__mongooseCached = cached;

  return cached.conn;
}

module.exports = {
  connect,
  mongoose
};