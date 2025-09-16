const express = require('express');
const router = express.Router();
const sunflowerService = require('../services/sunflowerLandService');
const db = require('../config/database');

/**
 * Test kết nối API Sunflower Land
 */
router.get('/test-connection', async (req, res) => {
  try {
    const result = await sunflowerService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test connection',
      message: error.message
    });
  }
});

/**
 * Lấy thông tin farm của player
 */
router.get('/player/:playerId/farm', async (req, res) => {
  try {
    const { playerId } = req.params;
    const result = await sunflowerService.getPlayerFarm(playerId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player farm',
      message: error.message
    });
  }
});

/**
 * Lấy danh sách cây trồng của player
 */
router.get('/player/:playerId/crops', async (req, res) => {
  try {
    const { playerId } = req.params;
    const result = await sunflowerService.getPlayerCrops(playerId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player crops',
      message: error.message
    });
  }
});

/**
 * Lấy thông tin inventory của player
 */
router.get('/player/:playerId/inventory', async (req, res) => {
  try {
    const { playerId } = req.params;
    const result = await sunflowerService.getPlayerInventory(playerId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player inventory',
      message: error.message
    });
  }
});

/**
 * Lấy thông tin profile của player
 */
router.get('/player/:playerId/profile', async (req, res) => {
  try {
    const { playerId } = req.params;
    const result = await sunflowerService.getPlayerProfile(playerId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player profile',
      message: error.message
    });
  }
});

/**
 * Lấy danh sách các loại cây trồng có sẵn
 */
router.get('/crops', async (req, res) => {
  try {
    const result = await sunflowerService.getAvailableCrops();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available crops',
      message: error.message
    });
  }
});

/**
 * Sync dữ liệu cây trồng từ game vào database
 */
router.post('/sync/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    // Lấy user ID từ token (tạm thời dùng user ID 1)
    const userId = 1; // TODO: Extract from JWT token
    
    const result = await sunflowerService.syncPlayerCrops(playerId, userId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to sync player crops',
      message: error.message
    });
  }
});

/**
 * Lưu player ID của user
 */
router.post('/link-player', async (req, res) => {
  try {
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({
        success: false,
        error: 'Player ID is required'
      });
    }
    
    // Lấy user ID từ token (tạm thời dùng user ID 1)
    const userId = 1; // TODO: Extract from JWT token
    
    // Cập nhật player ID vào database
    await db('users').where({ id: userId }).update({
      sunflower_player_id: playerId,
      updated_at: db.fn.now()
    });
    
    // Sync dữ liệu cây trồng
    const syncResult = await sunflowerService.syncPlayerCrops(playerId, userId);
    
    res.json({
      success: true,
      message: 'Player ID linked successfully',
      playerId: playerId,
      syncResult: syncResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to link player ID',
      message: error.message
    });
  }
});

/**
 * Lấy thông tin player ID đã liên kết
 */
router.get('/linked-player', async (req, res) => {
  try {
    // Lấy user ID từ token (tạm thời dùng user ID 1)
    const userId = 1; // TODO: Extract from JWT token
    
    const user = await db('users').where({ id: userId }).first();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      playerId: user.sunflower_player_id,
      linked: !!user.sunflower_player_id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get linked player ID',
      message: error.message
    });
  }
});

/**
 * Webhook để nhận thông báo từ Sunflower Land
 */
router.post('/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('🌻 Sunflower Land webhook received:', { event, data });
    
    // Xử lý các loại event khác nhau
    switch (event) {
      case 'crop_ready':
        await handleCropReadyEvent(data);
        break;
      case 'crop_planted':
        await handleCropPlantedEvent(data);
        break;
      case 'crop_harvested':
        await handleCropHarvestedEvent(data);
        break;
      default:
        console.log('Unknown event type:', event);
    }
    
    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
      message: error.message
    });
  }
});

/**
 * Xử lý event cây trồng sẵn sàng thu hoạch
 */
async function handleCropReadyEvent(data) {
  try {
    const { playerId, cropId, cropName } = data;
    
    // Tìm user theo player ID
    const user = await db('users').where({ sunflower_player_id: playerId }).first();
    
    if (!user) {
      console.log('User not found for player ID:', playerId);
      return;
    }
    
    // Tạo thông báo
    await db('notifications').insert({
      user_id: user.id,
      type: 'harvest_reminder',
      title: 'Cây trồng sẵn sàng thu hoạch!',
      message: `${cropName} của bạn đã sẵn sàng để thu hoạch.`,
      read: false,
      sent_to_telegram: false
    });
    
    // Gửi thông báo Telegram nếu đã liên kết
    if (user.telegram_linked && user.telegram_chat_id) {
      const telegramService = require('../services/telegramService');
      await telegramService.sendMessage(
        user.telegram_chat_id,
        `🌾 Cây trồng sẵn sàng thu hoạch!\n\n${cropName} của bạn đã sẵn sàng để thu hoạch. Hãy vào game để thu hoạch nhé!`
      );
    }
    
    console.log('Crop ready notification sent for user:', user.id);
  } catch (error) {
    console.error('Error handling crop ready event:', error);
  }
}

/**
 * Xử lý event cây trồng được trồng
 */
async function handleCropPlantedEvent(data) {
  try {
    const { playerId, cropId, cropName } = data;
    
    // Tìm user theo player ID
    const user = await db('users').where({ sunflower_player_id: playerId }).first();
    
    if (!user) {
      console.log('User not found for player ID:', playerId);
      return;
    }
    
    // Tạo thông báo
    await db('notifications').insert({
      user_id: user.id,
      type: 'crop_planted',
      title: 'Cây trồng mới được trồng',
      message: `Bạn đã trồng ${cropName}. Hãy chờ đợi để thu hoạch!`,
      read: false,
      sent_to_telegram: false
    });
    
    console.log('Crop planted notification created for user:', user.id);
  } catch (error) {
    console.error('Error handling crop planted event:', error);
  }
}

/**
 * Xử lý event cây trồng được thu hoạch
 */
async function handleCropHarvestedEvent(data) {
  try {
    const { playerId, cropId, cropName, amount } = data;
    
    // Tìm user theo player ID
    const user = await db('users').where({ sunflower_player_id: playerId }).first();
    
    if (!user) {
      console.log('User not found for player ID:', playerId);
      return;
    }
    
    // Tạo thông báo
    await db('notifications').insert({
      user_id: user.id,
      type: 'crop_harvested',
      title: 'Cây trồng đã được thu hoạch!',
      message: `Bạn đã thu hoạch ${amount} ${cropName}. Chúc mừng!`,
      read: false,
      sent_to_telegram: false
    });
    
    console.log('Crop harvested notification created for user:', user.id);
  } catch (error) {
    console.error('Error handling crop harvested event:', error);
  }
}

// Lấy thông tin giá cả từ sfl.world
router.get('/prices', async (req, res) => {
  try {
    const result = await sunflowerService.getPrices();
    res.json(result);
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Lấy thông tin exchange từ sfl.world
router.get('/exchange', async (req, res) => {
  try {
    const result = await sunflowerService.getExchange();
    res.json(result);
  } catch (error) {
    console.error('Error fetching exchange:', error);
    res.status(500).json({ error: 'Failed to fetch exchange data' });
  }
});

module.exports = router;
