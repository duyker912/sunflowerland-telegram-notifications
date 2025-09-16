// Simple Blockchain Routes
const express = require('express');
const router = express.Router();

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
    // Mock Base network test
    res.json({
      success: true,
      data: {
        network: 'Base',
        chainId: '8453',
        blockNumber: 12345678,
        gasPrice: '0.001 gwei',
        connected: true
      }
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
    // Mock Polygon network test
    res.json({
      success: true,
      data: {
        network: 'Polygon',
        chainId: '137',
        blockNumber: 87654321,
        gasPrice: '30 gwei',
        connected: true
      }
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
    res.json({
      success: true,
      data: {
        base: {
          success: true,
          data: {
            network: 'Base',
            chainId: '8453',
            blockNumber: 12345678,
            gasPrice: '0.001 gwei',
            connected: true
          }
        },
        polygon: {
          success: true,
          data: {
            network: 'Polygon',
            chainId: '137',
            blockNumber: 87654321,
            gasPrice: '30 gwei',
            connected: true
          }
        }
      }
    });
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
    res.json({
      success: true,
      data: {
        address: '0x3e12b9d6a4d12cd9b4a6d613872d0eb32f68b380',
        name: 'FLOWER',
        symbol: 'FLOWER',
        decimals: 18,
        totalSupply: '21000000',
        network: 'base'
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


