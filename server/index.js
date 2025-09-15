const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import cron service
const cronService = require('./services/cronService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://sunflowerland-telegram-notifications-production.up.railway.app',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.'
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/telegram', require('./routes/telegram').router);
app.use('/api/polygon', require('./routes/polygon'));
app.use('/api/blockchain', require('./routes/blockchain'));

// Check database schema
app.get('/api/check-schema', async (req, res) => {
  try {
    const { checkSchema } = require('./check-schema');
    const schema = await checkSchema();
    res.json({
      success: true,
      data: schema
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test blockchain endpoint
app.get('/api/blockchain/test', (req, res) => {
  res.json({
    success: true,
    message: 'Blockchain endpoint is working!',
    timestamp: new Date().toISOString(),
    networks: ['base', 'polygon']
  });
});

// Test notification service
app.post('/api/test-notification', async (req, res) => {
  try {
    const notificationService = require('./services/notificationService');
    const result = await notificationService.checkAndSendHarvestNotifications();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send test harvest notification
app.post('/api/test-harvest-notification/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notificationService = require('./services/notificationService');
    
    // Tạo mock crop data
    const mockCrop = {
      id: 'test-crop-1',
      crop_name: 'Test Sunflower',
      harvest_time: new Date(),
      progress: 100,
      status: 'ready'
    };
    
    const result = await notificationService.sendHarvestNotification(userId, mockCrop);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cronJobs: cronService.getJobStatus()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Có lỗi xảy ra trên server',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint không tồn tại' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  cronService.stopJobs();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  cronService.stopJobs();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🕐 Cron jobs: ${Object.keys(cronService.getJobStatus()).length} jobs started`);
  console.log(`🗄️ Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`🤖 Telegram Bot: ${process.env.TELEGRAM_BOT_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
});

module.exports = app;