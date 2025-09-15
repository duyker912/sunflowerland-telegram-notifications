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

// Simple login route without database
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    
    // Mock user login (without database)
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      username: 'testuser',
      email,
      telegram_linked: false,
      notifications_enabled: true
    };
    
    res.json({
      message: 'Đăng nhập thành công (mock)',
      user,
      token: 'mock-jwt-token'
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi đăng nhập' });
  }
});

// Get current user info
app.get('/api/auth/me', async (req, res) => {
  try {
    const user = {
      id: 'mock-user-id',
      username: 'testuser',
      email: 'test@example.com',
      telegram_linked: false,
      notifications_enabled: true,
      notification_settings: {
        harvest_reminder: true,
        daily_summary: true,
        crop_ready: true
      },
      last_login: new Date().toISOString()
    };
    
    res.json({ user });
    
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi lấy thông tin người dùng' });
  }
});

// Get notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = [
      {
        id: 1,
        type: 'harvest_reminder',
        title: 'Cây trồng sẵn sàng thu hoạch!',
        message: 'Cà chua của bạn đã sẵn sàng để thu hoạch.',
        created_at: new Date().toISOString(),
        read: false
      },
      {
        id: 2,
        type: 'daily_summary',
        title: 'Tóm tắt hàng ngày',
        message: 'Bạn có 3 cây trồng cần chăm sóc hôm nay.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        read: true
      }
    ];
    
    res.json({ notifications });
    
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi lấy thông báo' });
  }
});

// Get user crops
app.get('/api/crops/user-crops', async (req, res) => {
  try {
    const userCrops = [
      {
        id: 1,
        crop_id: 1,
        crop_name: 'Cà chua',
        planted_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        harvest_time: new Date(Date.now() + 86400000 * 2).toISOString(),
        status: 'growing',
        progress: 75
      },
      {
        id: 2,
        crop_id: 2,
        crop_name: 'Cà rốt',
        planted_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        harvest_time: new Date(Date.now() + 86400000 * 1).toISOString(),
        status: 'ready',
        progress: 100
      }
    ];
    
    res.json({ userCrops });
    
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi lấy cây trồng' });
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
