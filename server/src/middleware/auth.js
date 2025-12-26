const verifyAdminKey = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const validKey = process.env.ADMIN_API_KEY || 'admin123';
  
  if (!adminKey || adminKey !== validKey) {
    return res.status(401).json({
      success: false,
      message: "غير مصرح بالوصول"
    });
  }
  next();
};

module.exports = verifyAdminKey;