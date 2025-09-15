// Portal Service cho Sunflower Land
// Tạm thời sử dụng mock data để test hệ thống

class PortalService {
  constructor() {
    this.portalId = 'telegram-bot';
    this.mockData = this.generateMockData();
  }

  /**
   * Tạo mock data để test
   */
  generateMockData() {
    const now = Date.now();
    const harvestTime = now + (2 * 60 * 60 * 1000); // 2 giờ nữa

    return {
      farm: {
        id: '2749154680612546',
        playerId: '2749154680612546',
        player: {
          id: '2749154680612546',
          username: 'TestPlayer',
          level: 15,
          experience: 1250
        },
        crops: {
          '1': {
            id: '1',
            name: 'Sunflower',
            plantedAt: now - (30 * 60 * 1000), // 30 phút trước
            harvestedAt: harvestTime,
            growthTime: 2 * 60 * 60 * 1000, // 2 giờ
            amount: 1,
            x: 0,
            y: 0,
            status: 'growing'
          },
          '2': {
            id: '2',
            name: 'Potato',
            plantedAt: now - (45 * 60 * 1000), // 45 phút trước
            harvestedAt: harvestTime + (15 * 60 * 1000), // 15 phút sau
            growthTime: 2.25 * 60 * 60 * 1000, // 2.25 giờ
            amount: 1,
            x: 1,
            y: 0,
            status: 'growing'
          },
          '3': {
            id: '3',
            name: 'Carrot',
            plantedAt: now - (60 * 60 * 1000), // 1 giờ trước
            harvestedAt: harvestTime - (30 * 60 * 1000), // 30 phút trước (đã sẵn sàng)
            growthTime: 1.5 * 60 * 60 * 1000, // 1.5 giờ
            amount: 1,
            x: 2,
            y: 0,
            status: 'ready'
          }
        },
        inventory: {
          'Sunflower': 10,
          'Potato': 5,
          'Carrot': 3,
          'SFL': 1000
        }
      }
    };
  }

  /**
   * Lấy thông tin farm của player
   */
  async getPlayerFarm(playerId) {
    try {
      // Tạm thời trả về mock data
      return {
        success: true,
        data: this.mockData.farm
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
      const farm = this.mockData.farm;
      const crops = [];
      
      // Transform data từ game state
      if (farm.crops) {
        Object.entries(farm.crops).forEach(([key, crop]) => {
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
      return {
        success: true,
        data: this.mockData.farm.inventory || {}
      };
    } catch (error) {
      console.error('Error fetching player inventory:', error.message);
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }

  /**
   * Lấy profile của player
   */
  async getPlayerProfile(playerId) {
    try {
      return {
        success: true,
        data: this.mockData.farm.player || {}
      };
    } catch (error) {
      console.error('Error fetching player profile:', error.message);
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }

  /**
   * Lấy danh sách cây trồng có sẵn trong game
   */
  async getAvailableCrops() {
    try {
      // Mock crop definitions
      const cropDefinitions = {
        'Sunflower': {
          name: 'Sunflower',
          growthTime: 2 * 60 * 60 * 1000, // 2 giờ
          sellPrice: 0.02,
          buyPrice: 0.01
        },
        'Potato': {
          name: 'Potato',
          growthTime: 2.25 * 60 * 60 * 1000, // 2.25 giờ
          sellPrice: 0.14,
          buyPrice: 0.07
        },
        'Carrot': {
          name: 'Carrot',
          growthTime: 1.5 * 60 * 60 * 1000, // 1.5 giờ
          sellPrice: 0.08,
          buyPrice: 0.04
        }
      };

      return {
        success: true,
        data: cropDefinitions
      };
    } catch (error) {
      console.error('Error fetching available crops:', error.message);
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }

  /**
   * Kiểm tra kết nối Portal
   */
  async testConnection() {
    try {
      return {
        success: true,
        message: 'Portal connection successful (Mock Data)',
        data: {
          status: 'ok',
          timestamp: new Date().toISOString(),
          farmId: this.mockData.farm.id,
          playerId: this.mockData.farm.playerId,
          portalId: this.portalId,
          mode: 'mock'
        }
      };
    } catch (error) {
      console.error('Portal connection test failed:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Portal connection failed'
      };
    }
  }

  /**
   * Sync dữ liệu cây trồng từ game vào database
   */
  async syncPlayerCrops(playerId, userId) {
    try {
      const cropsResult = await this.getPlayerCrops(playerId);
      
      if (!cropsResult.success) {
        return cropsResult;
      }

      const crops = cropsResult.data;
      const db = require('../config/database');

      // Xóa crops cũ của user
      await db('user_crops').where({ user_id: userId }).del();

      // Thêm crops mới
      for (const crop of crops) {
        await db('user_crops').insert({
          user_id: userId,
          crop_name: crop.name,
          planted_at: crop.planted_at,
          harvest_time: crop.harvest_time,
          status: crop.status,
          progress: crop.progress,
          quantity: crop.quantity,
          x: crop.x,
          y: crop.y,
          game_data: JSON.stringify(crop)
        });
      }

      return {
        success: true,
        message: `Synced ${crops.length} crops for player ${playerId}`,
        data: {
          syncedCrops: crops.length,
          playerId: playerId,
          userId: userId
        }
      };
    } catch (error) {
      console.error('Error syncing player crops:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Helper functions
  getCropStatus(crop) {
    const now = Date.now();
    if (crop.harvestedAt && crop.harvestedAt < now) {
      return 'harvested';
    } else if (crop.plantedAt + (crop.growthTime || 0) <= now) {
      return 'ready';
    }
    return 'growing';
  }

  calculateProgress(crop) {
    const now = Date.now();
    const plantedAt = crop.plantedAt;
    const growthTime = crop.growthTime || 0;

    if (!plantedAt || growthTime === 0) {
      return 0;
    }

    const harvestTime = plantedAt + growthTime;

    if (now >= harvestTime) {
      return 100;
    }

    const elapsed = now - plantedAt;
    const progress = (elapsed / growthTime) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  }
}

module.exports = new PortalService();
