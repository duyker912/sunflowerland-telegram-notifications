const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Khởi tạo Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Webhook endpoint cho Telegram
router.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    
    if (update.message) {
      await handleMessage(update.message);
    }
    
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook error' });
  }
});

// Xử lý tin nhắn từ Telegram
async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;
  const username = message.from.username;

  try {
    if (text === '/start') {
      await bot.sendMessage(chatId, 
        `🌻 Chào mừng đến với Sunflower Land Notifications!\n\n` +
        `Để sử dụng bot, bạn cần:\n` +
        `1. Đăng ký tài khoản trên website\n` +
        `2. Liên kết tài khoản Telegram\n` +
        `3. Cài đặt thông báo thu hoạch\n\n` +
        `Sử dụng /help để xem các lệnh khác.`
      );
    }
    else if (text === '/help') {
      await bot.sendMessage(chatId,
        `📋 Danh sách lệnh:\n\n` +
        `/start - Bắt đầu sử dụng bot\n` +
        `/help - Hiển thị trợ giúp\n` +
        `/link <code> - Liên kết tài khoản (sử dụng code từ website)\n` +
        `/settings - Cài đặt thông báo\n` +
        `/status - Kiểm tra trạng thái\n` +
        `/unlink - Hủy liên kết tài khoản\n\n` +
        `💡 Tip: Sử dụng website để quản lý thông báo dễ dàng hơn!`,
        { parse_mode: 'HTML' }
      );
    }
    else if (text.startsWith('/link ')) {
      const code = text.split(' ')[1];
      await handleLinkAccount(chatId, code, username);
    }
    else if (text === '/settings') {
      await showSettings(chatId);
    }
    else if (text === '/status') {
      await showStatus(chatId);
    }
    else if (text === '/unlink') {
      await unlinkAccount(chatId);
    }
    else {
      await bot.sendMessage(chatId, 
        `❓ Lệnh không được nhận diện. Sử dụng /help để xem danh sách lệnh.`
      );
    }
  } catch (error) {
    console.error('Handle message error:', error);
    await bot.sendMessage(chatId, '❌ Có lỗi xảy ra, vui lòng thử lại sau.');
  }
}

// Xử lý callback query (inline keyboard)
async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;

  try {
    if (data.startsWith('toggle_notification_')) {
      const cropId = data.split('_')[2];
      await toggleNotification(chatId, cropId, messageId);
    }
    else if (data === 'refresh_status') {
      await showStatus(chatId, messageId);
    }
    
    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.error('Handle callback query error:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Có lỗi xảy ra' });
  }
}

// Liên kết tài khoản
async function handleLinkAccount(chatId, code, username) {
  try {
    // Tìm user với code liên kết (có thể implement logic tạo code tạm thời)
    const user = await db('users')
      .where({ telegram_username: username })
      .orWhere('telegram_chat_id', chatId.toString())
      .first();

    if (!user) {
      await bot.sendMessage(chatId, 
        `❌ Không tìm thấy tài khoản để liên kết.\n\n` +
        `Vui lòng:\n` +
        `1. Đăng ký tài khoản trên website\n` +
        `2. Sử dụng lệnh /link với code từ website`
      );
      return;
    }

    // Cập nhật thông tin Telegram
    await db('users').where({ id: user.id }).update({
      telegram_chat_id: chatId.toString(),
      telegram_username: username,
      telegram_linked: true
    });

    await bot.sendMessage(chatId, 
      `✅ Liên kết tài khoản thành công!\n\n` +
      `Tài khoản: ${user.username}\n` +
      `Email: ${user.email}\n\n` +
      `Bây giờ bạn sẽ nhận được thông báo thu hoạch tự động!`
    );
  } catch (error) {
    console.error('Link account error:', error);
    await bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi liên kết tài khoản.');
  }
}

// Hiển thị cài đặt
async function showSettings(chatId) {
  try {
    const user = await db('users').where({ telegram_chat_id: chatId.toString() }).first();
    
    if (!user) {
      await bot.sendMessage(chatId, '❌ Tài khoản chưa được liên kết. Sử dụng /link để liên kết.');
      return;
    }

    const crops = await db('crops').where({ is_active: true });
    const userCrops = await db('user_crops')
      .join('crops', 'user_crops.crop_id', 'crops.id')
      .where('user_crops.user_id', user.id)
      .select('crops.*', 'user_crops.notification_sent');

    let message = `⚙️ Cài đặt thông báo cho ${user.username}\n\n`;
    
    if (userCrops.length === 0) {
      message += `📝 Bạn chưa có cây trồng nào.\n`;
      message += `Hãy trồng cây trong game để nhận thông báo!`;
    } else {
      message += `🌱 Cây trồng của bạn:\n\n`;
      
      for (const crop of userCrops) {
        const status = crop.notification_sent ? '✅' : '⏰';
        message += `${status} ${crop.name} - ${crop.harvest_time}s\n`;
      }
    }

    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Show settings error:', error);
    await bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi hiển thị cài đặt.');
  }
}

// Hiển thị trạng thái
async function showStatus(chatId, messageId = null) {
  try {
    const user = await db('users').where({ telegram_chat_id: chatId.toString() }).first();
    
    if (!user) {
      await bot.sendMessage(chatId, '❌ Tài khoản chưa được liên kết. Sử dụng /link để liên kết.');
      return;
    }

    const readyToHarvest = await db('user_crops')
      .join('crops', 'user_crops.crop_id', 'crops.id')
      .where('user_crops.user_id', user.id)
      .where('user_crops.is_harvested', false)
      .where('harvest_ready_at', '<=', db.fn.now())
      .select('crops.name');

    const totalCrops = await db('user_crops')
      .where('user_id', user.id)
      .count('* as count')
      .first();

    let message = `📊 Trạng thái tài khoản: ${user.username}\n\n`;
    message += `🌱 Tổng cây trồng: ${totalCrops.count}\n`;
    message += `⏰ Sẵn sàng thu hoạch: ${readyToHarvest.length}\n\n`;

    if (readyToHarvest.length > 0) {
      message += `🎯 Cây sẵn sàng thu hoạch:\n`;
      readyToHarvest.forEach(crop => {
        message += `• ${crop.name}\n`;
      });
    } else {
      message += `😴 Chưa có cây nào sẵn sàng thu hoạch.`;
    }

    const keyboard = {
      inline_keyboard: [[
        { text: '🔄 Làm mới', callback_data: 'refresh_status' }
      ]]
    };

    if (messageId) {
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard
      });
    } else {
      await bot.sendMessage(chatId, message, { reply_markup: keyboard });
    }
  } catch (error) {
    console.error('Show status error:', error);
    await bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi hiển thị trạng thái.');
  }
}

// Hủy liên kết tài khoản
async function unlinkAccount(chatId) {
  try {
    const user = await db('users').where({ telegram_chat_id: chatId.toString() }).first();
    
    if (!user) {
      await bot.sendMessage(chatId, '❌ Tài khoản chưa được liên kết.');
      return;
    }

    await db('users').where({ id: user.id }).update({
      telegram_chat_id: null,
      telegram_username: null,
      telegram_linked: false
    });

    await bot.sendMessage(chatId, 
      `✅ Đã hủy liên kết tài khoản thành công.\n\n` +
      `Bạn sẽ không còn nhận được thông báo thu hoạch.\n` +
      `Sử dụng /link để liên kết lại.`
    );
  } catch (error) {
    console.error('Unlink account error:', error);
    await bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi hủy liên kết tài khoản.');
  }
}

// Gửi thông báo thu hoạch
async function sendHarvestNotification(userId, cropName, quantity) {
  try {
    const user = await db('users').where({ id: userId }).first();
    
    if (!user || !user.telegram_linked || !user.telegram_chat_id) {
      return false;
    }

    const message = 
      `🌻 Thông báo thu hoạch!\n\n` +
      `🎯 ${cropName} đã sẵn sàng thu hoạch!\n` +
      `📦 Số lượng: ${quantity}\n\n` +
      `Hãy vào game để thu hoạch ngay!`;

    await bot.sendMessage(user.telegram_chat_id, message);
    
    // Cập nhật trạng thái đã gửi thông báo
    await db('user_crops')
      .where({ user_id: userId })
      .where({ crop_id: await getCropIdByName(cropName) })
      .update({ notification_sent: true });

    return true;
  } catch (error) {
    console.error('Send harvest notification error:', error);
    return false;
  }
}

// Helper function
async function getCropIdByName(cropName) {
  const crop = await db('crops').where({ name: cropName }).first();
  return crop ? crop.id : null;
}

// Export functions for use in other modules
module.exports = {
  router,
  sendHarvestNotification,
  bot
};
