// Multi-Chain Blockchain Routes
const express = require('express');
const router = express.Router();
const multiChainService = require('../services/polygonService');
const auth = require('../middleware/auth');

// Test blockchain connection
router.get('/test-connection', async (req, res) => {
  try {
    const { network = 'polygon' } = req.query;
    const result = await multiChainService.testConnection(network);
    res.json(result);
  } catch (error) {
    console.error('Error in test-connection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Polygon routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Test all blockchain connections
router.get('/test-all-connections', async (req, res) => {
  try {
    const result = await multiChainService.testAllConnections();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get token info from Base network
router.get('/token/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { network = 'base' } = req.query;
    
    const result = await multiChainService.getTokenInfo(address, network);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Discover farm contracts
router.get('/discover-farms', async (req, res) => {
  try {
    const farmDiscoveryService = require('../services/farmDiscovery');
    const result = await farmDiscoveryService.getAllFarmContracts();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Find farms by pattern
router.get('/find-farms-pattern', async (req, res) => {
  try {
    const farmDiscoveryService = require('../services/farmDiscovery');
    const result = await farmDiscoveryService.findFarmsByPattern();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze address for farm contract
router.get('/analyze-address/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const farmDiscoveryService = require('../services/farmDiscovery');
    const result = await farmDiscoveryService.analyzeAddress(address);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start monitoring blockchain events
router.post('/start-monitoring', async (req, res) => {
  try {
    const { contractAddress, network = 'base', eventTypes = ['Transfer'] } = req.body;
    
    if (!contractAddress) {
      return res.status(400).json({
        success: false,
        error: 'Contract address is required'
      });
    }
    
    const eventMonitorService = require('../services/eventMonitor');
    const result = await eventMonitorService.startMonitoring(contractAddress, network, eventTypes);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop monitoring blockchain events
router.post('/stop-monitoring', async (req, res) => {
  try {
    const { contractAddress, network = 'base' } = req.body;
    
    if (!contractAddress) {
      return res.status(400).json({
        success: false,
        error: 'Contract address is required'
      });
    }
    
    const eventMonitorService = require('../services/eventMonitor');
    const result = await eventMonitorService.stopMonitoring(contractAddress, network);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get monitoring status
router.get('/monitoring-status', async (req, res) => {
  try {
    const eventMonitorService = require('../services/eventMonitor');
    const result = eventMonitorService.getMonitoringStatus();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get farm data from blockchain
router.get('/farm/:farmId', auth, async (req, res) => {
  try {
    const { farmId } = req.params;
    const result = await polygonService.getFarmData(farmId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get farm transaction history
router.get('/farm/:farmId/transactions', auth, async (req, res) => {
  try {
    const { farmId } = req.params;
    const { limit = 50 } = req.query;
    
    const result = await polygonService.getFarmTransactionHistory(farmId, parseInt(limit));
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start watching blockchain events
router.post('/watch-events', auth, async (req, res) => {
  try {
    const result = await polygonService.watchBlockchainEvents();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Link farm ID to user account
router.post('/link-farm', auth, async (req, res) => {
  try {
    const { farmId } = req.body;
    const userId = req.user.id;
    
    if (!farmId) {
      return res.status(400).json({
        success: false,
        error: 'Farm ID is required'
      });
    }

    const db = require('../config/database');
    
    // Cập nhật farm ID cho user
    await db('users')
      .where({ id: userId })
      .update({ sunflower_farm_id: farmId });

    res.json({
      success: true,
      message: 'Farm ID linked successfully',
      data: { farmId, userId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get linked farm ID
router.get('/linked-farm', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = require('../config/database');
    
    const user = await db('users')
      .where({ id: userId })
      .select('sunflower_farm_id')
      .first();

    if (!user || !user.sunflower_farm_id) {
      return res.status(404).json({
        success: false,
        error: 'No farm ID linked'
      });
    }

    res.json({
      success: true,
      data: { farmId: user.sunflower_farm_id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync farm data from blockchain
router.post('/sync-farm/:farmId', auth, async (req, res) => {
  try {
    const { farmId } = req.params;
    const userId = req.user.id;
    
    // Lấy dữ liệu từ blockchain
    const blockchainData = await polygonService.getFarmData(farmId);
    
    if (!blockchainData.success) {
      return res.status(500).json(blockchainData);
    }

    const db = require('../config/database');
    
    // Xóa crops cũ của user
    await db('user_crops').where({ user_id: userId }).del();
    
    // Thêm crops mới từ blockchain
    const crops = blockchainData.data.crops;
    for (const crop of crops) {
      await db('user_crops').insert({
        user_id: userId,
        crop_id: crop.id,
        planted_at: crop.plantedAt,
        harvest_time: crop.harvestTime,
        status: crop.harvested ? 'harvested' : 'growing',
        progress: crop.harvested ? 100 : 0,
        blockchain_data: JSON.stringify({
          farmId: farmId,
          cropId: crop.id,
          source: 'blockchain'
        })
      });
    }

    res.json({
      success: true,
      message: `Synced ${crops.length} crops from blockchain`,
      data: {
        farmId: farmId,
        userId: userId,
        syncedCrops: crops.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
