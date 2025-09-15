const express = require('express');
const cors = require('cors');

// Load environment variables
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: './env.production' });
} else {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://sunflowerland-telegram-notifications-production.up.railway.app'
  ],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Database test route
app.get('/api/db-test', async (req, res) => {
  try {
    // Debug environment variables
    const envDebug = {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV
    };
    
    const db = require('./config/database');
    const result = await db.raw('SELECT 1 as test');
    res.json({ 
      message: 'Database connected!', 
      result: result.rows[0],
      env: envDebug
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database connection failed', 
      message: error.message,
      env: {
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_NAME: process.env.DB_NAME,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'NOT_SET',
        NODE_ENV: process.env.NODE_ENV
      }
    });
  }
});

// Simple register route without database
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Simple validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    
    // Mock user creation (without database)
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      created_at: new Date().toISOString()
    };
    
    res.status(201).json({
      message: 'Đăng ký thành công (mock)',
      user,
      token: 'mock-jwt-token'
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi đăng ký' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint không tồn tại' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
