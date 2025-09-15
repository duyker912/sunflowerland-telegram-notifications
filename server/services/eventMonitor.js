// Real-time Event Monitor cho blockchain events
const { ethers } = require('ethers');

class EventMonitorService {
  constructor() {
    this.providers = {};
    this.contracts = {};
    this.eventListeners = {};
    this.initializeProviders();
  }

  /**
   * Khởi tạo providers cho các networks
   */
  initializeProviders() {
    try {
      // Base Network
      this.providers.base = new ethers.JsonRpcProvider('https://mainnet.base.org');
      
      // Polygon Network
      this.providers.polygon = new ethers.JsonRpcProvider('https://polygon-rpc.com');
      
      console.log('🌐 Event Monitor initialized for Base and Polygon');
    } catch (error) {
      console.error('❌ Error initializing event monitor:', error.message);
    }
  }

  /**
   * Bắt đầu monitor events cho một contract
   */
  async startMonitoring(contractAddress, network = 'base', eventTypes = ['Transfer']) {
    try {
      console.log(`👀 Starting event monitoring for ${contractAddress} on ${network}`);
      
      const provider = this.providers[network];
      if (!provider) {
        throw new Error(`Provider for ${network} not found`);
      }

      // ERC20 ABI cơ bản
      const contractABI = [
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        'event Approval(address indexed owner, address indexed spender, uint256 value)',
        'function name() view returns (string)',
        'function symbol() view returns (string)'
      ];

      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      // Lưu contract reference
      this.contracts[`${network}_${contractAddress}`] = contract;

      // Bắt đầu monitor Transfer events với error handling
      if (eventTypes.includes('Transfer')) {
        contract.on('Transfer', async (from, to, value, event) => {
          try {
            await this.handleTransferEvent({
              network,
              contractAddress,
              from,
              to,
              value: ethers.formatUnits(value, 18), // FLOWER có 18 decimals
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              timestamp: new Date()
            });
          } catch (error) {
            console.error('Error handling Transfer event:', error.message);
          }
        });
        
        // Handle filter errors
        contract.on('error', (error) => {
          console.error('Contract filter error:', error.message);
        });
      }

      // Bắt đầu monitor Approval events với error handling
      if (eventTypes.includes('Approval')) {
        contract.on('Approval', async (owner, spender, value, event) => {
          try {
            await this.handleApprovalEvent({
              network,
              contractAddress,
              owner,
              spender,
              value: ethers.formatUnits(value, 18),
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              timestamp: new Date()
            });
          } catch (error) {
            console.error('Error handling Approval event:', error.message);
          }
        });
      }

      console.log(`✅ Event monitoring started for ${contractAddress}`);
      
      return {
        success: true,
        message: `Event monitoring started for ${contractAddress} on ${network}`,
        contractAddress,
        network,
        eventTypes
      };
    } catch (error) {
      console.error('Error starting event monitoring:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Xử lý Transfer events
   */
  async handleTransferEvent(eventData) {
    try {
      console.log(`🔄 Transfer Event: ${eventData.from} → ${eventData.to} (${eventData.value} FLOWER)`);
      
      // Lưu event vào database
      await this.saveEventToDatabase('Transfer', eventData);
      
      // Kiểm tra xem có phải farm transaction không
      const isFarmTransaction = await this.analyzeFarmTransaction(eventData);
      
      if (isFarmTransaction.isFarm) {
        console.log(`🌻 Farm Transaction detected: ${eventData.transactionHash}`);
        await this.handleFarmTransaction(eventData, isFarmTransaction);
      }
      
    } catch (error) {
      console.error('Error handling transfer event:', error.message);
    }
  }

  /**
   * Xử lý Approval events
   */
  async handleApprovalEvent(eventData) {
    try {
      console.log(`✅ Approval Event: ${eventData.owner} → ${eventData.spender} (${eventData.value} FLOWER)`);
      
      // Lưu event vào database
      await this.saveEventToDatabase('Approval', eventData);
      
    } catch (error) {
      console.error('Error handling approval event:', error.message);
    }
  }

  /**
   * Phân tích xem có phải farm transaction không
   */
  async analyzeFarmTransaction(eventData) {
    try {
      // Kiểm tra các patterns thường gặp trong farm transactions
      const farmPatterns = [
        '0x0000000000000000000000000000000000000000', // Mint/Burn
        '0x1234567890123456789012345678901234567890', // Farm contract (mock)
        '0x2345678901234567890123456789012345678901'  // Another farm contract (mock)
      ];

      const isMint = eventData.from === '0x0000000000000000000000000000000000000000';
      const isBurn = eventData.to === '0x0000000000000000000000000000000000000000';
      const isFarmContract = farmPatterns.includes(eventData.from) || farmPatterns.includes(eventData.to);

      return {
        isFarm: isMint || isBurn || isFarmContract,
        type: isMint ? 'mint' : isBurn ? 'burn' : isFarmContract ? 'farm_transfer' : 'regular_transfer',
        confidence: isMint || isBurn ? 0.9 : isFarmContract ? 0.7 : 0.1
      };
    } catch (error) {
      console.error('Error analyzing farm transaction:', error.message);
      return { isFarm: false, type: 'unknown', confidence: 0 };
    }
  }

  /**
   * Xử lý farm transaction
   */
  async handleFarmTransaction(eventData, analysis) {
    try {
      console.log(`🌻 Processing farm transaction: ${analysis.type}`);
      
      // Tìm user trong database dựa trên address
      const db = require('../config/database');
      const user = await db('users')
        .where({ wallet_address: eventData.to })
        .first();

      if (user) {
        // Cập nhật user's FLOWER balance
        await this.updateUserBalance(user.id, eventData.value, analysis.type);
        
        // Gửi notification nếu cần
        if (analysis.type === 'mint' && parseFloat(eventData.value) > 100) {
          await this.sendFarmNotification(user.id, {
            type: 'flower_earned',
            amount: eventData.value,
            transactionHash: eventData.transactionHash
          });
        }
      }
      
    } catch (error) {
      console.error('Error handling farm transaction:', error.message);
    }
  }

  /**
   * Cập nhật balance của user
   */
  async updateUserBalance(userId, amount, type) {
    try {
      const db = require('../config/database');
      
      // Lấy current balance
      const user = await db('users').where({ id: userId }).first();
      const currentBalance = parseFloat(user.flower_balance || 0);
      const changeAmount = parseFloat(amount);
      
      let newBalance;
      if (type === 'mint') {
        newBalance = currentBalance + changeAmount;
      } else if (type === 'burn') {
        newBalance = Math.max(0, currentBalance - changeAmount);
      } else {
        newBalance = currentBalance; // Không thay đổi cho transfer
      }
      
      // Cập nhật database
      await db('users')
        .where({ id: userId })
        .update({
          flower_balance: newBalance.toString(),
          updated_at: new Date()
        });
      
      console.log(`💰 Updated user ${userId} balance: ${currentBalance} → ${newBalance} FLOWER`);
      
    } catch (error) {
      console.error('Error updating user balance:', error.message);
    }
  }

  /**
   * Gửi farm notification
   */
  async sendFarmNotification(userId, notificationData) {
    try {
      const db = require('../config/database');
      
      // Lưu notification vào database
      await db('notifications').insert({
        user_id: userId,
        title: '🌻 FLOWER Earned!',
        message: `You earned ${notificationData.amount} FLOWER tokens!`,
        type: notificationData.type,
        data: JSON.stringify(notificationData),
        sent: false,
        created_at: new Date()
      });
      
      // Gửi qua Telegram nếu user đã link
      const user = await db('users').where({ id: userId }).first();
      if (user && user.telegram_linked && user.notifications_enabled) {
        const { bot } = require('../routes/telegram');
        await bot.sendMessage(
          user.telegram_chat_id,
          `🌻 You earned ${notificationData.amount} FLOWER tokens!\n\n` +
          `Transaction: ${notificationData.transactionHash}\n` +
          `Keep farming! 🚜`
        );
      }
      
      console.log(`📱 Sent farm notification to user ${userId}`);
      
    } catch (error) {
      console.error('Error sending farm notification:', error.message);
    }
  }

  /**
   * Lưu event vào database
   */
  async saveEventToDatabase(eventType, eventData) {
    try {
      const db = require('../config/database');
      
      await db('blockchain_events').insert({
        event_type: eventType,
        network: eventData.network,
        contract_address: eventData.contractAddress,
        transaction_hash: eventData.transactionHash,
        block_number: eventData.blockNumber,
        event_data: JSON.stringify(eventData),
        created_at: new Date()
      });
      
    } catch (error) {
      console.error('Error saving event to database:', error.message);
    }
  }

  /**
   * Dừng monitoring cho một contract
   */
  async stopMonitoring(contractAddress, network = 'base') {
    try {
      const contractKey = `${network}_${contractAddress}`;
      const contract = this.contracts[contractKey];
      
      if (contract) {
        contract.removeAllListeners();
        delete this.contracts[contractKey];
        console.log(`🛑 Stopped monitoring ${contractAddress} on ${network}`);
        
        return {
          success: true,
          message: `Stopped monitoring ${contractAddress} on ${network}`
        };
      } else {
        return {
          success: false,
          error: 'Contract not found in monitoring list'
        };
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy danh sách contracts đang được monitor
   */
  getMonitoringStatus() {
    const status = {};
    
    Object.keys(this.contracts).forEach(key => {
      const [network, address] = key.split('_');
      if (!status[network]) {
        status[network] = [];
      }
      status[network].push(address);
    });
    
    return {
      success: true,
      data: {
        totalContracts: Object.keys(this.contracts).length,
        networks: status
      }
    };
  }
}

module.exports = new EventMonitorService();
