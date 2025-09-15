const cron = require('node-cron');
const db = require('../config/database');
const notificationService = require('./notificationService');

class CronService {
  constructor() {
    this.jobs = new Map();
    this.startJobs();
  }

  startJobs() {
    // Kiểm tra cây sẵn sàng thu hoạch mỗi phút
    this.jobs.set('harvest-check', cron.schedule('* * * * *', async () => {
      await this.checkHarvestReady();
    }));

    // Gửi thông báo hàng ngày lúc 8:00
    this.jobs.set('daily-summary', cron.schedule('0 8 * * *', async () => {
      await this.sendDailySummary();
    }));

    // Dọn dẹp thông báo cũ mỗi ngày lúc 2:00
    this.jobs.set('cleanup', cron.schedule('0 2 * * *', async () => {
      await this.cleanupOldNotifications();
    }));

    console.log('🕐 Cron jobs started successfully');
  }

  async checkHarvestReady() {
    try {
      // Sử dụng notification service để kiểm tra và gửi thông báo
      const result = await notificationService.checkAndSendHarvestNotifications();
      
      if (result.success) {
        console.log(`🌻 ${result.message}`);
      } else {
        console.error(`❌ Error in harvest check: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error in harvest check cron job:', error);
    }
  }

  async sendDailySummary() {
    try {
      // Lấy tất cả user có liên kết Telegram
      const users = await db('users')
        .where('telegram_linked', true)
        .where('notifications_enabled', true)
        .select('id', 'username');

      for (const user of users) {
        try {
          // Sử dụng notification service để gửi daily summary
          const result = await notificationService.sendDailySummary(user.id);
          
          if (result.success) {
            console.log(`📊 Sent daily summary to user ${user.username}`);
          } else {
            console.error(`❌ Failed to send daily summary to user ${user.id}: ${result.error}`);
          }
        } catch (error) {
          console.error(`❌ Error sending daily summary to user ${user.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error in daily summary cron job:', error);
    }
  }

  async cleanupOldNotifications() {
    try {
      // Xóa thông báo cũ hơn 30 ngày
      const deleted = await db('notifications')
        .where('created_at', '<', db.raw("NOW() - INTERVAL '30 days'"))
        .del();

      console.log(`🧹 Cleaned up ${deleted} old notifications`);
    } catch (error) {
      console.error('❌ Error in cleanup cron job:', error);
    }
  }

  stopJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped cron job: ${name}`);
    });
    this.jobs.clear();
  }

  getJobStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });
    return status;
  }
}

module.exports = new CronService();
