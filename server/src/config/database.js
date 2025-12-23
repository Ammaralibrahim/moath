const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/poliklinik";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ MongoDB bağlantısı başarılı");
  })
  .catch((error) => {
    console.error("❌ MongoDB bağlantı hatası:", error);
    process.exit(1);
  });

module.exports = mongoose;