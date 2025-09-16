// Multi-Chain Service cho Sunflower Land Blockchain Integration
const { ethers } = require('ethers');

class MultiChainService {
  constructor() {
    this.providers = {};
    this.contracts = {};
    this.initializeProviders();
  }

  /**
   * Khởi tạo Web3 providers cho nhiều networks
   */
  initializeProviders() {
    try {
      // Polygon Mainnet
      const polygonRpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
      this.providers.polygon = new ethers.JsonRpcProvider(polygonRpcUrl);
      
      // Base Mainnet
      const baseRpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
      this.providers.base = new ethers.JsonRpcProvider(baseRpcUrl);
      
      console.log('🌐 Connected to multiple networks: Polygon, Base');
    } catch (error) {
      console.error('❌ Error connecting to networks:', error.message);
    }
  }

  /**
   * Lấy provider theo network
   */
  getProvider(network = 'polygon') {
    return this.providers[network] || this.providers.polygon;
  }

  /**
   * Test tất cả kết nối blockchain
   */
  async testAllConnections() {
    const results = {};
    
    // Test Base network
    try {
      const baseProvider = this.getProvider('base');
      const baseBlockNumber = await baseProvider.getBlockNumber();
      const baseGasPrice = await baseProvider.getFeeData();
      
      results.base = {
        success: true,
        data: {
          network: 'Base',
          chainId: '8453',
          blockNumber: baseBlockNumber,
          gasPrice: `${ethers.formatUnits(baseGasPrice.gasPrice, 'gwei')} gwei`,
          connected: true
        }
      };
    } catch (error) {
      results.base = {
        success: false,
        error: error.message,
        data: null
      };
    }

    // Test Polygon network
    try {
      const polygonProvider = this.getProvider('polygon');
      const polygonBlockNumber = await polygonProvider.getBlockNumber();
      const polygonGasPrice = await polygonProvider.getFeeData();
      
      results.polygon = {
        success: true,
        data: {
          network: 'Polygon',
          chainId: '137',
          blockNumber: polygonBlockNumber,
          gasPrice: `${ethers.formatUnits(polygonGasPrice.gasPrice, 'gwei')} gwei`,
          connected: true
        }
      };
    } catch (error) {
      results.polygon = {
        success: false,
        error: error.message,
        data: null
      };
    }

    return {
      success: true,
      data: results
    };
  }

  /**
   * Lấy thông tin farm từ blockchain
   */
  async getFarmData(farmId, network = 'polygon') {
    try {
      const provider = this.getProvider(network);
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      // Sunflower Land Farm Contract Address (cần cập nhật với địa chỉ thật)
      const farmContractAddress = network === 'base' 
        ? process.env.SUNFLOWER_FARM_CONTRACT_BASE || '0x...'
        : process.env.SUNFLOWER_FARM_CONTRACT || '0x...';
      
      // ABI cơ bản cho Farm contract
      const farmABI = [
        'function getFarm(uint256 farmId) view returns (tuple(uint256 id, address owner, uint256 createdAt, uint256 lastHarvest))',
        'function getCrops(uint256 farmId) view returns (tuple(uint256 id, string name, uint256 plantedAt, uint256 harvestTime, bool harvested)[])',
        'event CropPlanted(uint256 indexed farmId, uint256 indexed cropId, string name, uint256 plantedAt)',
        'event CropHarvested(uint256 indexed farmId, uint256 indexed cropId, uint256 timestamp)'
      ];

      const farmContract = new ethers.Contract(farmContractAddress, farmABI, provider);
      
      // Lấy thông tin farm
      const farmData = await farmContract.getFarm(farmId);
      
      // Lấy danh sách crops
      const cropsData = await farmContract.getCrops(farmId);
      
      return {
        success: true,
        data: {
          farm: {
            id: farmData.id.toString(),
            owner: farmData.owner,
            createdAt: new Date(farmData.createdAt.toNumber() * 1000),
            lastHarvest: new Date(farmData.lastHarvest.toNumber() * 1000)
          },
          crops: cropsData.map(crop => ({
            id: crop.id.toString(),
            name: crop.name,
            plantedAt: new Date(crop.plantedAt.toNumber() * 1000),
            harvestTime: new Date(crop.harvestTime.toNumber() * 1000),
            harvested: crop.harvested
          }))
        }
      };
    } catch (error) {
      console.error('Error getting farm data from blockchain:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Theo dõi events từ blockchain
   */
  async watchBlockchainEvents() {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const farmContractAddress = process.env.SUNFLOWER_FARM_CONTRACT || '0x...';
      const farmABI = [
        'event CropPlanted(uint256 indexed farmId, uint256 indexed cropId, string name, uint256 plantedAt)',
        'event CropHarvested(uint256 indexed farmId, uint256 indexed cropId, uint256 timestamp)'
      ];

      const farmContract = new ethers.Contract(farmContractAddress, farmABI, this.provider);

      // Theo dõi event CropPlanted
      farmContract.on('CropPlanted', async (farmId, cropId, name, plantedAt, event) => {
        console.log(`🌱 New crop planted: ${name} on farm ${farmId.toString()}`);
        
        // Sync với database
        await this.syncCropPlantedEvent({
          farmId: farmId.toString(),
          cropId: cropId.toString(),
          name: name,
          plantedAt: new Date(plantedAt.toNumber() * 1000),
          transactionHash: event.transactionHash
        });
      });

      // Theo dõi event CropHarvested
      farmContract.on('CropHarvested', async (farmId, cropId, timestamp, event) => {
        console.log(`🎉 Crop harvested: ${cropId.toString()} on farm ${farmId.toString()}`);
        
        // Sync với database
        await this.syncCropHarvestedEvent({
          farmId: farmId.toString(),
          cropId: cropId.toString(),
          timestamp: new Date(timestamp.toNumber() * 1000),
          transactionHash: event.transactionHash
        });
      });

      console.log('👀 Started watching blockchain events');
      
      return {
        success: true,
        message: 'Blockchain event watcher started'
      };
    } catch (error) {
      console.error('Error watching blockchain events:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sync crop planted event với database
   */
  async syncCropPlantedEvent(eventData) {
    try {
      const db = require('../config/database');
      
      // Tìm user theo farm ID
      const user = await db('users')
        .where({ sunflower_farm_id: eventData.farmId })
        .first();

      if (!user) {
        console.log(`No user found for farm ID: ${eventData.farmId}`);
        return;
      }

      // Thêm crop vào database
      await db('user_crops').insert({
        user_id: user.id,
        crop_id: eventData.cropId,
        planted_at: eventData.plantedAt,
        harvest_time: new Date(eventData.plantedAt.getTime() + (2 * 60 * 60 * 1000)), // 2 giờ
        status: 'growing',
        progress: 0,
        blockchain_data: JSON.stringify({
          transactionHash: eventData.transactionHash,
          farmId: eventData.farmId,
          cropId: eventData.cropId
        })
      });

      console.log(`✅ Synced crop planted event for user ${user.id}`);
    } catch (error) {
      console.error('Error syncing crop planted event:', error.message);
    }
  }

  /**
   * Sync crop harvested event với database
   */
  async syncCropHarvestedEvent(eventData) {
    try {
      const db = require('../config/database');
      
      // Tìm user theo farm ID
      const user = await db('users')
        .where({ sunflower_farm_id: eventData.farmId })
        .first();

      if (!user) {
        console.log(`No user found for farm ID: ${eventData.farmId}`);
        return;
      }

      // Cập nhật crop trong database
      await db('user_crops')
        .where({ 
          user_id: user.id,
          crop_id: eventData.cropId
        })
        .update({
          status: 'harvested',
          progress: 100,
          updated_at: new Date()
        });

      console.log(`✅ Synced crop harvested event for user ${user.id}`);
    } catch (error) {
      console.error('Error syncing crop harvested event:', error.message);
    }
  }

  /**
   * Lấy transaction history của farm
   */
  async getFarmTransactionHistory(farmId, limit = 50) {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const farmContractAddress = process.env.SUNFLOWER_FARM_CONTRACT || '0x...';
      const farmABI = [
        'event CropPlanted(uint256 indexed farmId, uint256 indexed cropId, string name, uint256 plantedAt)',
        'event CropHarvested(uint256 indexed farmId, uint256 indexed cropId, uint256 timestamp)'
      ];

      const farmContract = new ethers.Contract(farmContractAddress, farmABI, this.provider);
      
      // Lấy events gần đây
      const plantedFilter = farmContract.filters.CropPlanted(farmId);
      const harvestedFilter = farmContract.filters.CropHarvested(farmId);
      
      const [plantedEvents, harvestedEvents] = await Promise.all([
        farmContract.queryFilter(plantedFilter, -1000), // 1000 blocks gần đây
        farmContract.queryFilter(harvestedFilter, -1000)
      ]);

      // Kết hợp và sắp xếp events
      const allEvents = [
        ...plantedEvents.map(event => ({
          type: 'planted',
          farmId: event.args.farmId.toString(),
          cropId: event.args.cropId.toString(),
          name: event.args.name,
          timestamp: new Date(event.args.plantedAt.toNumber() * 1000),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        })),
        ...harvestedEvents.map(event => ({
          type: 'harvested',
          farmId: event.args.farmId.toString(),
          cropId: event.args.cropId.toString(),
          timestamp: new Date(event.args.timestamp.toNumber() * 1000),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        }))
      ].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

      return {
        success: true,
        data: allEvents
      };
    } catch (error) {
      console.error('Error getting farm transaction history:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Lấy thông tin token từ Base network
   */
  async getTokenInfo(tokenAddress, network = 'base') {
    try {
      const provider = this.getProvider(network);
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      // ERC20 ABI cơ bản
      const tokenABI = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)',
        'function balanceOf(address owner) view returns (uint256)'
      ];

      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply()
      ]);

      return {
        success: true,
        data: {
          address: tokenAddress,
          name: name,
          symbol: symbol,
          decimals: Number(decimals),
          totalSupply: ethers.formatUnits(totalSupply, decimals),
          network: network
        }
      };
    } catch (error) {
      console.error('Error getting token info:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Kiểm tra kết nối blockchain
   */
  async testConnection(network = 'polygon') {
    try {
      const provider = this.getProvider(network);
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      const networkInfo = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      const gasPrice = await provider.getGasPrice();

      return {
        success: true,
        data: {
          network: networkInfo.name,
          chainId: networkInfo.chainId.toString(),
          blockNumber: blockNumber,
          gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' gwei',
          connected: true
        }
      };
    } catch (error) {
      console.error('Error testing blockchain connection:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Test tất cả networks
   */
  async testAllConnections() {
    const results = {};
    
    for (const network of ['polygon', 'base']) {
      try {
        results[network] = await this.testConnection(network);
      } catch (error) {
        results[network] = {
          success: false,
          error: error.message
        };
      }
    }

    return {
      success: true,
      data: results
    };
  }
}

module.exports = new MultiChainService();
