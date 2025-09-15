const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const telegramLinkSchema = Joi.object({
  telegram_chat_id: Joi.string().required(),
  telegram_username: Joi.string().optional()
});

// Đăng ký tài khoản
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password } = value;

    // Kiểm tra email đã tồn tại
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    // Kiểm tra username đã tồn tại
    const existingUsername = await db('users').where({ username }).first();
    if (existingUsername) {
      return res.status(400).json({ error: 'Tên người dùng đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Tạo user mới
    const [user] = await db('users').insert({
      username,
      email,
      password_hash: passwordHash
    }).returning(['id', 'username', 'email', 'created_at']);

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Đăng ký thành công',
      user,
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Lỗi server khi đăng ký' });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Tìm user
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra mật khẩu
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Cập nhật last_login
    await db('users').where({ id: user.id }).update({
      last_login: db.fn.now()
    });

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        telegram_linked: user.telegram_linked,
        notifications_enabled: user.notifications_enabled
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi server khi đăng nhập' });
  }
});

// Liên kết Telegram
router.post('/telegram', auth, async (req, res) => {
  try {
    const { error, value } = telegramLinkSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { telegram_chat_id, telegram_username } = value;
    const userId = req.user.userId;

    // Kiểm tra telegram_chat_id đã được sử dụng
    const existingTelegram = await db('users')
      .where({ telegram_chat_id })
      .where('id', '!=', userId)
      .first();

    if (existingTelegram) {
      return res.status(400).json({ error: 'Tài khoản Telegram này đã được liên kết' });
    }

    // Cập nhật thông tin Telegram
    await db('users').where({ id: userId }).update({
      telegram_chat_id,
      telegram_username,
      telegram_linked: true
    });

    res.json({
      message: 'Liên kết Telegram thành công',
      telegram_linked: true
    });

  } catch (error) {
    console.error('Telegram link error:', error);
    res.status(500).json({ error: 'Lỗi server khi liên kết Telegram' });
  }
});

// Hủy liên kết Telegram
router.delete('/telegram', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    await db('users').where({ id: userId }).update({
      telegram_chat_id: null,
      telegram_username: null,
      telegram_linked: false
    });

    res.json({
      message: 'Hủy liên kết Telegram thành công',
      telegram_linked: false
    });

  } catch (error) {
    console.error('Telegram unlink error:', error);
    res.status(500).json({ error: 'Lỗi server khi hủy liên kết Telegram' });
  }
});

// Lấy thông tin user hiện tại
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await db('users')
      .select('id', 'username', 'email', 'telegram_linked', 'notifications_enabled', 'notification_settings', 'last_login')
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy thông tin người dùng' });
  }
});

module.exports = router;
