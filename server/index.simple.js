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

// Test migrations
app.get('/api/migrate-test', async (req, res) => {
  try {
    const db = require('./config/database');
    
    // Try to create a simple table
    await db.raw(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert test data
    await db.raw(`
      INSERT INTO test_table (name) VALUES ('test') 
      ON CONFLICT DO NOTHING
    `);
    
    // Select test data
    const result = await db.raw('SELECT * FROM test_table LIMIT 1');
    
    res.json({ 
      message: 'Migrations test successful!', 
      result: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Migrations test failed', 
      message: error.message
    });
  }
});

// Check database tables
app.get('/api/check-tables', async (req, res) => {
  try {
    const db = require('./config/database');
    
    // Get all tables
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // Check if our tables exist
    const tableNames = tables.rows.map(row => row.table_name);
    const expectedTables = ['users', 'crops', 'user_crops', 'notifications'];
    const missingTables = expectedTables.filter(table => !tableNames.includes(table));
    
    res.json({ 
      message: 'Database tables check',
      all_tables: tableNames,
      expected_tables: expectedTables,
      missing_tables: missingTables,
      migrations_needed: missingTables.length > 0
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to check tables', 
      message: error.message
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

// Link Telegram account
app.post('/api/auth/telegram', async (req, res) => {
  try {
    const { telegram_chat_id, telegram_username } = req.body;
    
    if (!telegram_chat_id) {
      return res.status(400).json({ error: 'Thiếu telegram_chat_id' });
    }
    
    // Mock telegram linking (without database)
    console.log(`🔗 Linking Telegram: ${telegram_username} (${telegram_chat_id})`);
    
    // Send welcome message to Telegram
    const welcomeMessage = `🎉 Chúc mừng! Tài khoản đã được liên kết thành công!

🌻 Sunflower Land Bot đã sẵn sàng:
• Nhận thông báo thu hoạch
• Tóm tắt hàng ngày
• Cập nhật trạng thái cây trồng

📋 Sử dụng /status để xem trạng thái cây trồng hiện tại.`;
    
    await sendTelegramMessage(telegram_chat_id, welcomeMessage);
    
    res.json({
      message: 'Liên kết Telegram thành công',
      telegram_linked: true,
      telegram_chat_id,
      telegram_username
    });
    
  } catch (error) {
    console.error('Telegram link error:', error);
    res.status(500).json({ error: 'Lỗi server khi liên kết Telegram' });
  }
});

// Unlink Telegram account
app.delete('/api/auth/telegram', async (req, res) => {
  try {
    // Mock telegram unlinking (without database)
    console.log('🔓 Unlinking Telegram account');
    
    res.json({
      message: 'Hủy liên kết Telegram thành công',
      telegram_linked: false
    });
    
  } catch (error) {
    console.error('Telegram unlink error:', error);
    res.status(500).json({ error: 'Lỗi server khi hủy liên kết Telegram' });
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

// Telegram Bot Webhook
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'No message received' });
    }
    
    const chatId = message.chat.id;
    const text = message.text;
    const username = message.from.username || message.from.first_name;
    
    console.log(`📱 Telegram message from ${username} (${chatId}): ${text}`);
    
    // Handle different commands
    if (text === '/start') {
      const welcomeMessage = `🌻 Chào mừng ${username} đến với Sunflower Land Bot!

🤖 Bot này sẽ giúp bạn:
• Nhận thông báo khi cây trồng sẵn sàng thu hoạch
• Tóm tắt hàng ngày về cây trồng
• Cập nhật trạng thái cây trồng

📋 Các lệnh có sẵn:
/start - Bắt đầu
/help - Trợ giúp
/status - Xem trạng thái cây trồng
/chatid - Lấy Chat ID để liên kết

💡 Để sử dụng đầy đủ tính năng, hãy liên kết tài khoản trên website!`;
      
      await sendTelegramMessage(chatId, welcomeMessage);
    }
    else if (text === '/help') {
      const helpMessage = `🆘 Trợ giúp Sunflower Land Bot:

📋 Các lệnh:
/start - Bắt đầu bot
/help - Hiển thị trợ giúp này
/status - Xem trạng thái cây trồng
/chatid - Lấy Chat ID để liên kết

🔗 Liên kết tài khoản:
1. Vào website: http://localhost:3000
2. Đăng nhập tài khoản
3. Vào Settings → Telegram
4. Nhập Chat ID: ${chatId}
5. Nhấn "Liên kết"

🌱 Sau khi liên kết, bạn sẽ nhận được:
• Thông báo thu hoạch
• Tóm tắt hàng ngày
• Cập nhật trạng thái cây trồng`;
      
      await sendTelegramMessage(chatId, helpMessage);
    }
    else if (text === '/status') {
      const statusMessage = `🌱 Trạng thái cây trồng:

🍅 Cà chua: 75% (2 ngày nữa)
🥕 Cà rốt: 100% (Sẵn sàng thu hoạch!)

📊 Tổng cộng: 2 cây trồng
⏰ Cập nhật lần cuối: ${new Date().toLocaleString('vi-VN')}`;
      
      await sendTelegramMessage(chatId, statusMessage);
    }
    else if (text === '/chatid') {
      const chatIdMessage = `🆔 Chat ID của bạn: ${chatId}

📋 Để liên kết tài khoản:
1. Vào website: http://localhost:3000
2. Đăng nhập tài khoản
3. Vào Settings → Telegram
4. Nhập Chat ID: ${chatId}
5. Nhấn "Liên kết"

✅ Sau khi liên kết, bạn sẽ nhận được thông báo tự động!`;
      
      await sendTelegramMessage(chatId, chatIdMessage);
    }
    else {
      const unknownMessage = `❓ Lệnh không được nhận diện: ${text}

📋 Sử dụng /help để xem danh sách lệnh có sẵn.`;
      
      await sendTelegramMessage(chatId, unknownMessage);
    }
    
    res.json({ status: 'success' });
    
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Function to send Telegram message
async function sendTelegramMessage(chatId, text) {
  try {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN || '7114824299:AAFPcvGp_PC0XJ4Kxk_phOJpSEViNf3T9bQ';
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }
    
    console.log(`✅ Telegram message sent to ${chatId}`);
    
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
}

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
