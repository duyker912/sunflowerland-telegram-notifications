// Simple Blockchain Routes
const express = require('express');
const router = express.Router();
const polygonService = require('../services/polygonService');

// Test blockchain connection
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Blockchain routes are working!',
    timestamp: new Date().toISOString(),
    networks: ['base', 'polygon']
  });
});

// Test Base network connection
router.get('/base/test', async (req, res) => {
  try {
    const result = await polygonService.testAllConnections();
    res.json({
      success: result.data.base.success,
      data: result.data.base.data,
      error: result.data.base.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test Polygon network connection
router.get('/polygon/test', async (req, res) => {
  try {
    const result = await polygonService.testAllConnections();
    res.json({
      success: result.data.polygon.success,
      data: result.data.polygon.data,
      error: result.data.polygon.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test all connections
router.get('/test-all', async (req, res) => {
  try {
    const result = await polygonService.testAllConnections();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get FLOWER token info
router.get('/token/flower', async (req, res) => {
  try {
    const result = await polygonService.getTokenInfo('0x3e12b9d6a4d12cd9b4a6d613872d0eb32f68b380', 'base');
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get blockchain events
router.get('/events', async (req, res) => {
  try {
    const db = require('../config/database');
    const events = await db('blockchain_events')
      .orderBy('timestamp', 'desc')
      .limit(50);
    
    res.json({
      success: true,
      events: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start monitoring
router.post('/start-monitoring', async (req, res) => {
  try {
    const eventMonitor = require('../services/eventMonitor');
    const result = await eventMonitor.startMonitoring();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop monitoring
router.post('/stop-monitoring', async (req, res) => {
  try {
    const eventMonitor = require('../services/eventMonitor');
    const result = await eventMonitor.stopMonitoring();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;


