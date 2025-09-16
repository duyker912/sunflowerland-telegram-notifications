const axios = require('axios');
const portalService = require('./portalService');

class SunflowerLandService {
  constructor() {
    this.baseURL = process.env.SUNFLOWER_API_URL || 'https://sfl.world/api/v1';
    this.jwtToken = process.env.SUNFLOWER_JWT_TOKEN; // JWT token thay vì API key
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;
    this.useMockData = false; // Sử dụng API thực tế
  }

  /**
   * Rate limiting để tránh spam API
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Lấy thông tin farm của player
   */
  async getPlayerFarm(playerId) {
    try {
      if (this.useMockData) {
        return await portalService.getPlayerFarm(playerId);
      }

      await this.rateLimit();
      
      // Sử dụng API mới từ sfl.world
      const response = await axios.get(`${this.baseURL}/land/info/farm_id/${playerId}`, {
        timeout: 10000
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching player farm:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Lấy danh sách cây trồng hiện tại
   */
  async getPlayerCrops(playerId) {
    try {
      if (this.useMockData) {
        return await portalService.getPlayerCrops(playerId);
      }

      await this.rateLimit();
      
      // Sử dụng API thật của Sunflower Land
      const response = await axios.get(`${this.baseURL}/portal/2749154680612546/player`, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      // Transform data từ game state
      const gameState = response.data.farm;
      const crops = [];
      
      // Lấy crops từ game state
      if (gameState.crops) {
        Object.entries(gameState.crops).forEach(([key, crop]) => {
          if (crop && crop.plantedAt) {
            crops.push({
              id: key,
              name: crop.name || 'Unknown Crop',
              planted_at: new Date(crop.plantedAt),
              harvest_time: new Date(crop.harvestedAt || crop.plantedAt + (crop.growthTime || 3600000)),
              status: this.getCropStatus(crop),
              progress: this.calculateProgress(crop),
              quantity: crop.amount || 1,
              x: crop.x || 0,
              y: crop.y || 0
            });
          }
        });
      }

      return {
        success: true,
        data: crops
      };
    } catch (error) {
      console.error('Error fetching player crops:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Lấy thông tin inventory của player
   */
  async getPlayerInventory(playerId) {
    try {
      if (this.useMockData) {
        return await portalService.getPlayerInventory(playerId);
      }

      await this.rateLimit();
      
      const response = await axios.get(`${this.baseURL}/portal/2749154680612546/player`, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching player inventory:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Lấy thông tin player profile
   */
  async getPlayerProfile(playerId) {
    try {
      if (this.useMockData) {
        return await portalService.getPlayerProfile(playerId);
      }

      await this.rateLimit();
      
      const response = await axios.get(`${this.baseURL}/portal/2749154680612546/player`, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching player profile:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Xác định trạng thái cây trồng
   */
  getCropStatus(crop) {
    const now = new Date();
    const harvestTime = new Date(crop.harvestAt);
    
    if (crop.harvested) {
      return 'harvested';
    } else if (harvestTime <= now) {
      return 'ready';
    } else {
      return 'growing';
    }
  }

  /**
   * Tính toán tiến độ phát triển
   */
  calculateProgress(crop) {
    const now = new Date();
    const plantedTime = new Date(crop.plantedAt);
    const harvestTime = new Date(crop.harvestAt);
    
    const totalTime = harvestTime - plantedTime;
    const elapsedTime = now - plantedTime;
    
    if (crop.harvested) {
      return 100;
    }
    
    const progress = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
    return Math.round(progress);
  }

  /**
   * Lấy thông tin về các loại cây trồng có sẵn
   */
  async getAvailableCrops() {
    try {
      if (this.useMockData) {
        return await portalService.getAvailableCrops();
      }

      await this.rateLimit();
      
      const response = await axios.get(`${this.baseURL}/crops`, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching available crops:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Kiểm tra kết nối API
   */
  async testConnection() {
    try {
      if (this.useMockData) {
        return await portalService.testConnection();
      }

      await this.rateLimit();
      
      // Test với API thật của Sunflower Land
      const response = await axios.get(`${this.baseURL}/portal/2749154680612546/player`, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      return {
        success: true,
        message: 'Sunflower Land API connection successful',
        data: {
          status: 'ok',
          timestamp: new Date().toISOString(),
          farmId: response.data.farm?.id,
          playerId: response.data.farm?.playerId
        }
      };
    } catch (error) {
      console.error('API connection test failed:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'API connection failed'
      };
    }
  }

  /**
   * Sync dữ liệu cây trồng từ game vào database
   */
  async syncPlayerCrops(playerId, userId) {
    try {
      if (this.useMockData) {
        return await portalService.syncPlayerCrops(playerId, userId);
      }

      const cropsResult = await this.getPlayerCrops(playerId);
      
      if (!cropsResult.success) {
        return {
          success: false,
          error: cropsResult.error
        };
      }

      const db = require('../config/database');
      
      // Xóa crops cũ của user
      await db('user_crops').where({ user_id: userId }).del();
      
      // Thêm crops mới
      const cropsToInsert = cropsResult.data.map(crop => ({
        user_id: userId,
        crop_id: crop.id,
        planted_at: crop.planted_at,
        harvest_time: crop.harvest_time,
        status: crop.status,
        progress: crop.progress,
        game_data: JSON.stringify({
          quantity: crop.quantity,
          x: crop.x,
          y: crop.y,
          name: crop.name
        })
      }));

      if (cropsToInsert.length > 0) {
        await db('user_crops').insert(cropsToInsert);
      }

      return {
        success: true,
        message: `Synced ${cropsToInsert.length} crops`,
        data: cropsToInsert
      };
    } catch (error) {
      console.error('Error syncing player crops:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy thông tin giá cả từ sfl.world
   */
  async getPrices() {
    try {
      await this.rateLimit();
      
      const response = await axios.get(`${this.baseURL}/prices`, {
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching prices:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Lấy thông tin exchange từ sfl.world
   */
  async getExchange() {
    try {
      await this.rateLimit();
      
      const response = await axios.get(`${this.baseURL}/exchange`, {
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching exchange:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Lấy thông tin NFTs từ sfl.world
   */
  async getNFTs() {
    try {
      await this.rateLimit();
      
      const response = await axios.get(`${this.baseURL}/nfts`, {
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching NFTs:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Lấy thông tin land boosts từ sfl.world
   */
  async getLandBoosts(nftId) {
    try {
      await this.rateLimit();
      
      const response = await axios.get(`${this.baseURL}/land/${nftId}`, {
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching land boosts:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Lấy thông tin land summary từ sfl.world
   */
  async getLandSummary(nftId) {
    try {
      await this.rateLimit();
      
      const response = await axios.get(`${this.baseURL}/land/${nftId}`, {
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching land summary:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Lấy thông tin land info bằng nft_id
   */
  async getLandInfoByNftId(nftId) {
    try {
      await this.rateLimit();
      
      const response = await axios.get(`${this.baseURL}/land/info/nft_id/${nftId}`, {
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching land info by nft_id:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Lấy thông tin land info bằng username
   */
  async getLandInfoByUsername(username) {
    try {
      await this.rateLimit();
      
      const response = await axios.get(`${this.baseURL}/land/info/username/${username}`, {
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching land info by username:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Lấy thông tin land info bằng farm_id
   */
  async getLandInfoByFarmId(farmId) {
    try {
      await this.rateLimit();
      
      const response = await axios.get(`${this.baseURL}/land/info/farm_id/${farmId}`, {
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching land info by farm_id:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

module.exports = new SunflowerLandService();
