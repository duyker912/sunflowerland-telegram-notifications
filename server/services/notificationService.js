// Notification Service cho Telegram Bot
const TelegramBot = require('node-telegram-bot-api');
const db = require('../config/database');

class NotificationService {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  }

  /**
   * Gửi thông báo harvest cho user
   */
  async sendHarvestNotification(userId, cropData) {
    try {
      // Lấy thông tin user
      const user = await db('users').where({ id: userId }).first();
      
      if (!user || !user.telegram_chat_id) {
        console.log(`User ${userId} không có Telegram chat ID`);
        return { success: false, error: 'No Telegram chat ID' };
      }

      // Tạo message
      const message = this.createHarvestMessage(cropData);
      
      // Gửi thông báo
      await this.bot.sendMessage(user.telegram_chat_id, message, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🌻 Xem Dashboard',
                url: 'https://sunflowerland-telegram-notifications-production.up.railway.app'
              }
            ],
            [
              {
                text: '✅ Đã thu hoạch',
                callback_data: `harvest_${cropData.id}`
              }
            ]
          ]
        }
      });

      // Lưu thông báo vào database
      await this.saveNotification(userId, 'Harvest Ready', message, true);

      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      console.error('Error sending harvest notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gửi thông báo daily summary
   */
  async sendDailySummary(userId) {
    try {
      const user = await db('users').where({ id: userId }).first();
      
      if (!user || !user.telegram_chat_id) {
        return { success: false, error: 'No Telegram chat ID' };
      }

      // Lấy thông tin crops
      const crops = await db('user_crops')
        .where({ user_id: userId })
        .orderBy('harvest_time', 'asc');

      const message = this.createDailySummaryMessage(crops);
      
      await this.bot.sendMessage(user.telegram_chat_id, message, {
        parse_mode: 'HTML'
      });

      await this.saveNotification(userId, 'Daily Summary', message, true);

      return { success: true, message: 'Daily summary sent' };
    } catch (error) {
      console.error('Error sending daily summary:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gửi thông báo cho tất cả users
   */
  async sendBroadcastNotification(message, title = 'System Notification') {
    try {
      const users = await db('users')
        .where({ telegram_linked: true })
        .whereNotNull('telegram_chat_id');

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          await this.bot.sendMessage(user.telegram_chat_id, message, {
            parse_mode: 'HTML'
          });
          await this.saveNotification(user.id, title, message, true);
          successCount++;
        } catch (error) {
          console.error(`Error sending to user ${user.id}:`, error.message);
          errorCount++;
        }
      }

      return {
        success: true,
        message: `Sent to ${successCount} users, ${errorCount} errors`
      };
    } catch (error) {
      console.error('Error sending broadcast:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Kiểm tra và gửi thông báo harvest
   */
  async checkAndSendHarvestNotifications() {
    try {
      console.log('🔍 Checking for harvest notifications...');
      
      // Lấy crops sẵn sàng thu hoạch
      const readyCrops = await db('user_crops')
        .where('harvest_time', '<=', new Date())
        .where('status', '!=', 'harvested');

      console.log(`Found ${readyCrops.length} crops ready for harvest`);

      for (const crop of readyCrops) {
        // Gửi thông báo
        const result = await this.sendHarvestNotification(crop.user_id, crop);
        
        if (result.success) {
          // Đánh dấu đã gửi thông báo bằng cách cập nhật status
          await db('user_crops')
            .where({ id: crop.id })
            .update({ status: 'notified' });
          
          console.log(`✅ Sent harvest notification for crop ${crop.id}`);
        } else {
          console.error(`❌ Failed to send notification for crop ${crop.id}:`, result.error);
        }
      }

      return {
        success: true,
        message: `Processed ${readyCrops.length} harvest notifications`
      };
    } catch (error) {
      console.error('Error checking harvest notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Tạo message thông báo harvest
   */
  createHarvestMessage(crop) {
    const harvestTime = new Date(crop.harvest_time).toLocaleString('vi-VN');
    
    return `🌻 <b>Thông báo thu hoạch!</b>\n\n` +
           `🌱 <b>Cây trồng:</b> ${crop.crop_name || 'Unknown'}\n` +
           `⏰ <b>Thời gian:</b> ${harvestTime}\n` +
           `📊 <b>Tiến độ:</b> ${crop.progress || 0}%\n\n` +
           `🎉 Cây trồng của bạn đã sẵn sàng để thu hoạch!\n` +
           `Hãy vào game để thu hoạch và trồng cây mới.`;
  }

  /**
   * Tạo message daily summary
   */
  createDailySummaryMessage(crops) {
    const now = new Date();
    const today = now.toLocaleDateString('vi-VN');
    
    let message = `📊 <b>Báo cáo hàng ngày - ${today}</b>\n\n`;
    
    if (crops.length === 0) {
      message += `🌱 Bạn chưa có cây trồng nào.\nHãy vào game để bắt đầu trồng cây!`;
    } else {
      const readyCrops = crops.filter(crop => 
        new Date(crop.harvest_time) <= now && crop.status !== 'harvested'
      );
      const growingCrops = crops.filter(crop => 
        new Date(crop.harvest_time) > now && crop.status !== 'harvested'
      );
      const harvestedCrops = crops.filter(crop => crop.status === 'harvested');

      message += `📈 <b>Thống kê:</b>\n`;
      message += `🌱 Tổng cây trồng: ${crops.length}\n`;
      message += `🎉 Sẵn sàng thu hoạch: ${readyCrops.length}\n`;
      message += `🌿 Đang phát triển: ${growingCrops.length}\n`;
      message += `✅ Đã thu hoạch: ${harvestedCrops.length}\n\n`;

      if (readyCrops.length > 0) {
        message += `🚨 <b>Cây sẵn sàng thu hoạch:</b>\n`;
        readyCrops.forEach(crop => {
          message += `• ${crop.crop_name || 'Unknown'}\n`;
        });
        message += `\n`;
      }

      if (growingCrops.length > 0) {
        message += `⏰ <b>Cây đang phát triển:</b>\n`;
        growingCrops.slice(0, 3).forEach(crop => {
          const timeLeft = this.getTimeLeft(crop.harvest_time);
          message += `• ${crop.crop_name || 'Unknown'} (${timeLeft})\n`;
        });
        if (growingCrops.length > 3) {
          message += `• ... và ${growingCrops.length - 3} cây khác\n`;
        }
      }
    }

    message += `\n🌻 <b>Chúc bạn có một ngày vui vẻ!</b>`;
    
    return message;
  }

  /**
   * Tính thời gian còn lại
   */
  getTimeLeft(harvestTime) {
    const now = new Date();
    const harvest = new Date(harvestTime);
    const diff = harvest - now;
    
    if (diff <= 0) return 'Sẵn sàng';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Lưu thông báo vào database
   */
  async saveNotification(userId, title, message, sent = false) {
    try {
      await db('notifications').insert({
        user_id: userId,
        title: title,
        message: message,
        sent: sent,
        created_at: new Date()
      });
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  /**
   * Xử lý callback query từ Telegram
   */
  async handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;

    try {
      if (data.startsWith('harvest_')) {
        const cropId = data.replace('harvest_', '');
        
        // Đánh dấu crop đã thu hoạch
        await db('user_crops')
          .where({ id: cropId })
          .update({ 
            status: 'harvested',
            updated_at: new Date()
          });

        // Cập nhật message
        await this.bot.editMessageText(
          '✅ Đã đánh dấu cây trồng đã thu hoạch!\nCảm ơn bạn đã sử dụng hệ thống thông báo.',
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🌻 Xem Dashboard',
                    url: 'https://sunflowerland-telegram-notifications-production.up.railway.app'
                  }
                ]
              ]
            }
          }
        );

        await this.bot.answerCallbackQuery(callbackQuery.id, {
          text: 'Đã cập nhật trạng thái thu hoạch!'
        });
      }
    } catch (error) {
      console.error('Error handling callback query:', error);
      await this.bot.answerCallbackQuery(callbackQuery.id, {
        text: 'Có lỗi xảy ra, vui lòng thử lại!'
      });
    }
  }
}

module.exports = new NotificationService();
