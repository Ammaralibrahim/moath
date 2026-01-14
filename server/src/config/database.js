// src/utils/dbConnect.js
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

let cached = global._mongo;

if (!cached) {
  cached = global._mongo = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = dbConnect;
