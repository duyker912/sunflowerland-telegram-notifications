const cron = require('node-cron');
const db = require('../config/database');
const { sendHarvestNotification } = require('../routes/telegram');

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
      // Tìm cây sẵn sàng thu hoạch chưa gửi thông báo
      const readyCrops = await db('user_crops')
        .join('crops', 'user_crops.crop_id', 'crops.id')
        .join('users', 'user_crops.user_id', 'users.id')
        .where('user_crops.is_harvested', false)
        .where('user_crops.notification_sent', false)
        .where('user_crops.harvest_ready_at', '<=', db.fn.now())
        .where('users.telegram_linked', true)
        .where('users.notifications_enabled', true)
        .select(
          'user_crops.id',
          'user_crops.user_id',
          'user_crops.quantity',
          'crops.name as crop_name',
          'users.telegram_chat_id'
        );

      for (const crop of readyCrops) {
        try {
          // Gửi thông báo qua Telegram
          const sent = await sendHarvestNotification(
            crop.user_id,
            crop.crop_name,
            crop.quantity
          );

          if (sent) {
            // Cập nhật trạng thái đã gửi thông báo
            await db('user_crops')
              .where('id', crop.id)
              .update({ notification_sent: true });

            // Tạo record thông báo
            await db('notifications').insert({
              user_id: crop.user_id,
              type: 'harvest_ready',
              title: 'Cây sẵn sàng thu hoạch!',
              message: `${crop.crop_name} đã sẵn sàng thu hoạch!`,
              data: {
                crop_id: crop.id,
                crop_name: crop.crop_name,
                quantity: crop.quantity
              },
              sent: true,
              sent_at: new Date()
            });

            console.log(`✅ Sent harvest notification for ${crop.crop_name} to user ${crop.user_id}`);
          }
        } catch (error) {
          console.error(`❌ Error sending notification for crop ${crop.id}:`, error);
        }
      }

      if (readyCrops.length > 0) {
        console.log(`🌻 Checked ${readyCrops.length} crops ready for harvest`);
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
        .select('id', 'telegram_chat_id', 'username');

      for (const user of users) {
        try {
          // Lấy thống kê cây trồng của user
          const stats = await db('user_crops')
            .where('user_id', user.id)
            .select(
              db.raw('COUNT(*) as total_crops'),
              db.raw('COUNT(CASE WHEN is_harvested = false AND harvest_ready_at <= NOW() THEN 1 END) as ready_to_harvest'),
              db.raw('COUNT(CASE WHEN is_harvested = false AND harvest_ready_at > NOW() THEN 1 END) as growing_crops')
            )
            .first();

          // Lấy cây sẵn sàng thu hoạch
          const readyCrops = await db('user_crops')
            .join('crops', 'user_crops.crop_id', 'crops.id')
            .where('user_crops.user_id', user.id)
            .where('user_crops.is_harvested', false)
            .where('user_crops.harvest_ready_at', '<=', db.fn.now())
            .select('crops.name', 'user_crops.quantity');

          if (stats.total_crops > 0) {
            let message = `📊 Báo cáo hàng ngày - ${new Date().toLocaleDateString('vi-VN')}\n\n`;
            message += `🌱 Tổng cây trồng: ${stats.total_crops}\n`;
            message += `⏰ Sẵn sàng thu hoạch: ${stats.ready_to_harvest}\n`;
            message += `🌿 Đang phát triển: ${stats.growing_crops}\n\n`;

            if (readyCrops.length > 0) {
              message += `🎯 Cây sẵn sàng thu hoạch:\n`;
              readyCrops.forEach(crop => {
                message += `• ${crop.name} (${crop.quantity})\n`;
              });
            } else {
              message += `😴 Chưa có cây nào sẵn sàng thu hoạch.`;
            }

            // Gửi thông báo qua Telegram
            const { bot } = require('../routes/telegram');
            await bot.sendMessage(user.telegram_chat_id, message);

            // Tạo record thông báo
            await db('notifications').insert({
              user_id: user.id,
              type: 'daily_summary',
              title: 'Báo cáo hàng ngày',
              message: message,
              data: {
                total_crops: stats.total_crops,
                ready_to_harvest: stats.ready_to_harvest,
                growing_crops: stats.growing_crops
              },
              sent: true,
              sent_at: new Date()
            });

            console.log(`📊 Sent daily summary to user ${user.username}`);
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
