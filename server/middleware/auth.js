const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Không có token, truy cập bị từ chối' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kiểm tra user còn tồn tại
    const user = await db('users').where({ id: decoded.userId }).first();
    if (!user) {
      return res.status(401).json({ error: 'Token không hợp lệ' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token không hợp lệ' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token đã hết hạn' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Lỗi server xác thực' });
  }
};

module.exports = auth;
