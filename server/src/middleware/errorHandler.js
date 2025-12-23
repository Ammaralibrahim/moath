module.exports = (error, req, res, next) => {
  console.error("Unhandled Error:", error);
  res.status(500).json({
    success: false,
    message: "حدث خطأ غير متوقع في الخادم",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};