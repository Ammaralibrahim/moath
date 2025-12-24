const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/poliklinik";

mongoose
  .connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 50, // Maksimum bağlantı sayısını artır
  serverSelectionTimeoutMS: 30000, // 30 saniye
  socketTimeoutMS: 60000, // 60 saniye
  connectTimeoutMS: 30000, // 30 saniye
  retryWrites: true,
  retryReads: true,
  w: 'majority'
  })
  .then(() => {
    console.log("✅ MongoDB bağlantısı başarılı");
  })
  .catch((error) => {
    console.error("❌ MongoDB bağlantı hatası:", error);
    process.exit(1);
  });

module.exports = mongoose;