const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const plantCropSchema = Joi.object({
  crop_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required()
});

const harvestCropSchema = Joi.object({
  crop_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required()
});

// Lấy danh sách tất cả cây trồng
router.get('/', async (req, res) => {
  try {
    const crops = await db('crops')
      .where({ is_active: true })
      .orderBy('name', 'asc');

    res.json({ crops });
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách cây trồng' });
  }
});

// Lấy thông tin chi tiết cây trồng
router.get('/:id', async (req, res) => {
  try {
    const cropId = req.params.id;
    
    const crop = await db('crops').where({ id: cropId, is_active: true }).first();
    
    if (!crop) {
      return res.status(404).json({ error: 'Không tìm thấy cây trồng' });
    }

    res.json({ crop });
  } catch (error) {
    console.error('Get crop error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy thông tin cây trồng' });
  }
});

// Lấy cây trồng của user
router.get('/user-crops', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const crops = await db('user_crops')
      .join('crops', 'user_crops.crop_id', 'crops.id')
      .where('user_crops.user_id', userId)
      .select(
        'user_crops.*',
        'crops.name',
        'crops.type',
        'crops.grow_time',
        'crops.harvest_time',
        'crops.sell_price',
        'crops.image_url',
        'crops.description'
      )
      .orderBy('user_crops.planted_at', 'desc');

    res.json({ crops });
  } catch (error) {
    console.error('Get user crops error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy cây trồng của user' });
  }
});

// Trồng cây mới
router.post('/plant', auth, async (req, res) => {
  try {
    const { error, value } = plantCropSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user.userId;
    const { crop_id, quantity } = value;

    // Kiểm tra cây trồng có tồn tại
    const crop = await db('crops').where({ id: crop_id, is_active: true }).first();
    if (!crop) {
      return res.status(404).json({ error: 'Không tìm thấy cây trồng' });
    }

    // Tính thời gian thu hoạch
    const plantedAt = new Date();
    const harvestReadyAt = new Date(plantedAt.getTime() + (crop.harvest_time * 1000));

    // Tạo user crop
    const [userCrop] = await db('user_crops').insert({
      user_id: userId,
      crop_id,
      quantity,
      planted_at: plantedAt,
      harvest_ready_at: harvestReadyAt
    }).returning('*');

    // Lấy thông tin đầy đủ
    const fullCrop = await db('user_crops')
      .join('crops', 'user_crops.crop_id', 'crops.id')
      .where('user_crops.id', userCrop.id)
      .select(
        'user_crops.*',
        'crops.name',
        'crops.type',
        'crops.grow_time',
        'crops.harvest_time',
        'crops.sell_price',
        'crops.image_url',
        'crops.description'
      )
      .first();

    res.status(201).json({
      message: 'Trồng cây thành công',
      crop: fullCrop
    });
  } catch (error) {
    console.error('Plant crop error:', error);
    res.status(500).json({ error: 'Lỗi server khi trồng cây' });
  }
});

// Thu hoạch cây
router.post('/harvest', auth, async (req, res) => {
  try {
    const { error, value } = harvestCropSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user.userId;
    const { crop_id, quantity } = value;

    // Kiểm tra cây trồng
    const userCrop = await db('user_crops')
      .join('crops', 'user_crops.crop_id', 'crops.id')
      .where('user_crops.id', crop_id)
      .where('user_crops.user_id', userId)
      .where('user_crops.is_harvested', false)
      .select(
        'user_crops.*',
        'crops.name',
        'crops.sell_price'
      )
      .first();

    if (!userCrop) {
      return res.status(404).json({ error: 'Không tìm thấy cây trồng hoặc đã thu hoạch' });
    }

    // Kiểm tra thời gian thu hoạch
    const now = new Date();
    const harvestTime = new Date(userCrop.harvest_ready_at);
    
    if (now < harvestTime) {
      const remainingTime = Math.ceil((harvestTime - now) / 1000);
      return res.status(400).json({ 
        error: `Cây chưa sẵn sàng thu hoạch. Còn ${remainingTime} giây.` 
      });
    }

    // Kiểm tra số lượng
    if (quantity > userCrop.quantity) {
      return res.status(400).json({ error: 'Số lượng thu hoạch vượt quá số lượng trồng' });
    }

    // Cập nhật trạng thái thu hoạch
    const harvestedQuantity = quantity;
    const remainingQuantity = userCrop.quantity - quantity;
    
    if (remainingQuantity <= 0) {
      // Thu hoạch hết
      await db('user_crops')
        .where('id', crop_id)
        .update({
          is_harvested: true,
          quantity: 0
        });
    } else {
      // Thu hoạch một phần
      await db('user_crops')
        .where('id', crop_id)
        .update({
          quantity: remainingQuantity
        });
    }

    // Tính lợi nhuận
    const profit = harvestedQuantity * userCrop.sell_price;

    res.json({
      message: 'Thu hoạch thành công',
      harvested: {
        crop_name: userCrop.name,
        quantity: harvestedQuantity,
        profit: profit,
        remaining: remainingQuantity
      }
    });
  } catch (error) {
    console.error('Harvest crop error:', error);
    res.status(500).json({ error: 'Lỗi server khi thu hoạch cây' });
  }
});

// Lấy thời gian thu hoạch của cây
router.get('/:id/harvest-time', async (req, res) => {
  try {
    const cropId = req.params.id;
    
    const crop = await db('crops').where({ id: cropId, is_active: true }).first();
    
    if (!crop) {
      return res.status(404).json({ error: 'Không tìm thấy cây trồng' });
    }

    res.json({
      crop_id: crop.id,
      crop_name: crop.name,
      harvest_time: crop.harvest_time,
      grow_time: crop.grow_time
    });
  } catch (error) {
    console.error('Get harvest time error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy thời gian thu hoạch' });
  }
});

// Lấy thống kê cây trồng của user
router.get('/user-crops/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const stats = await db('user_crops')
      .where('user_id', userId)
      .select(
        db.raw('COUNT(*) as total_crops'),
        db.raw('COUNT(CASE WHEN is_harvested = true THEN 1 END) as harvested_crops'),
        db.raw('COUNT(CASE WHEN is_harvested = false AND harvest_ready_at <= NOW() THEN 1 END) as ready_to_harvest'),
        db.raw('COUNT(CASE WHEN is_harvested = false AND harvest_ready_at > NOW() THEN 1 END) as growing_crops')
      )
      .first();

    res.json({ stats });
  } catch (error) {
    console.error('Get user crops stats error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy thống kê cây trồng' });
  }
});

module.exports = router;
