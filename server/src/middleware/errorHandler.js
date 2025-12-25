const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'خطأ في التحقق من البيانات',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `هذا ${field === 'phoneNumber' ? 'رقم الهاتف' : 'البريد الإلكتروني'} موجود مسبقاً`
    });
  }

  // Cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'معرف غير صالح'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'رمز غير صالح'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'انتهت صلاحية الرمز'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'حدث خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;