module.exports = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];
  const expectedKey = process.env.ADMIN_API_KEY || "admin123";

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: "غير مصرح بالوصول - تحقق من مفتاح المصادقة",
    });
  }
  next();
};