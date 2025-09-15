const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const auth = require('../middleware/auth');
const { sendHarvestNotification } = require('./telegram');

const router = express.Router();

// Validation schemas
const notificationSchema = Joi.object({
  type: Joi.string().valid('harvest_ready', 'crop_wilting', 'daily_summary').required(),
  title: Joi.string().required(),
  message: Joi.string().required(),
  data: Joi.object().default({}),
  scheduled_for: Joi.date().optional()
});

// Lấy danh sách thông báo của user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, type } = req.query;
    
    let query = db('notifications').where('user_id', userId);
    
    if (type) {
      query = query.where('type', type);
    }
    
    const notifications = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);
    
    const total = await db('notifications').where('user_id', userId).count('* as count').first();
    
    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy thông báo' });
  }
});

// Tạo thông báo mới
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = notificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user.userId;
    const { type, title, message, data, scheduled_for } = value;

    const [notification] = await db('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      data,
      scheduled_for: scheduled_for || new Date()
    }).returning('*');

    res.status(201).json({
      message: 'Tạo thông báo thành công',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Lỗi server khi tạo thông báo' });
  }
});

// Cập nhật thông báo
router.put('/:id', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId;
    
    const { error, value } = notificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Kiểm tra quyền sở hữu
    const existingNotification = await db('notifications')
      .where({ id: notificationId, user_id: userId })
      .first();
    
    if (!existingNotification) {
      return res.status(404).json({ error: 'Không tìm thấy thông báo' });
    }

    const { type, title, message, data, scheduled_for } = value;

    const [notification] = await db('notifications')
      .where({ id: notificationId })
      .update({
        type,
        title,
        message,
        data,
        scheduled_for: scheduled_for || existingNotification.scheduled_for
      })
      .returning('*');

    res.json({
      message: 'Cập nhật thông báo thành công',
      notification
    });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật thông báo' });
  }
});

// Xóa thông báo
router.delete('/:id', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId;

    // Kiểm tra quyền sở hữu
    const existingNotification = await db('notifications')
      .where({ id: notificationId, user_id: userId })
      .first();
    
    if (!existingNotification) {
      return res.status(404).json({ error: 'Không tìm thấy thông báo' });
    }

    await db('notifications').where({ id: notificationId }).del();

    res.json({ message: 'Xóa thông báo thành công' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Lỗi server khi xóa thông báo' });
  }
});

// Gửi thông báo thu hoạch thủ công
router.post('/send-harvest/:cropId', auth, async (req, res) => {
  try {
    const cropId = req.params.cropId;
    const userId = req.user.userId;

    // Lấy thông tin cây trồng
    const userCrop = await db('user_crops')
      .join('crops', 'user_crops.crop_id', 'crops.id')
      .where('user_crops.id', cropId)
      .where('user_crops.user_id', userId)
      .select('crops.name', 'user_crops.quantity')
      .first();

    if (!userCrop) {
      return res.status(404).json({ error: 'Không tìm thấy cây trồng' });
    }

    // Gửi thông báo qua Telegram
    const sent = await sendHarvestNotification(userId, userCrop.name, userCrop.quantity);
    
    if (sent) {
      // Tạo record thông báo
      await db('notifications').insert({
        user_id: userId,
        type: 'harvest_ready',
        title: 'Thông báo thu hoạch',
        message: `${userCrop.name} đã sẵn sàng thu hoạch!`,
        data: { crop_id: cropId, quantity: userCrop.quantity },
        sent: true,
        sent_at: new Date()
      });

      res.json({ message: 'Gửi thông báo thành công' });
    } else {
      res.status(400).json({ error: 'Không thể gửi thông báo. Vui lòng kiểm tra liên kết Telegram.' });
    }
  } catch (error) {
    console.error('Send harvest notification error:', error);
    res.status(500).json({ error: 'Lỗi server khi gửi thông báo' });
  }
});

// Lấy thống kê thông báo
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const stats = await db('notifications')
      .where('user_id', userId)
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('COUNT(CASE WHEN sent = true THEN 1 END) as sent'),
        db.raw('COUNT(CASE WHEN type = ? THEN 1 END) as harvest_ready', ['harvest_ready']),
        db.raw('COUNT(CASE WHEN type = ? THEN 1 END) as daily_summary', ['daily_summary'])
      )
      .first();

    res.json({ stats });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy thống kê thông báo' });
  }
});

module.exports = router;
