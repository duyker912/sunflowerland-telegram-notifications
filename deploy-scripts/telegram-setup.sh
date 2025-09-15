#!/bin/bash

# Script để setup Telegram Bot Webhook
# Sử dụng: ./telegram-setup.sh YOUR_BOT_TOKEN YOUR_RAILWAY_URL

BOT_TOKEN=$1
RAILWAY_URL=$2

if [ -z "$BOT_TOKEN" ] || [ -z "$RAILWAY_URL" ]; then
    echo "❌ Sử dụng: ./telegram-setup.sh YOUR_BOT_TOKEN YOUR_RAILWAY_URL"
    echo "Ví dụ: ./telegram-setup.sh 123456789:ABCdefGHIjklMNOpqrsTUVwxyz https://your-app.railway.app"
    exit 1
fi

echo "🤖 Setting up Telegram Bot..."
echo "Bot Token: ${BOT_TOKEN:0:10}..."
echo "Railway URL: $RAILWAY_URL"

# Kiểm tra bot token
echo "📡 Kiểm tra bot token..."
BOT_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe")
if echo "$BOT_INFO" | grep -q '"ok":true'; then
    BOT_USERNAME=$(echo "$BOT_INFO" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Bot token hợp lệ. Username: @$BOT_USERNAME"
else
    echo "❌ Bot token không hợp lệ!"
    exit 1
fi

# Xóa webhook cũ
echo "🗑️ Xóa webhook cũ..."
curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook"

# Set webhook mới
echo "🔗 Thiết lập webhook mới..."
WEBHOOK_URL="$RAILWAY_URL/api/telegram/webhook"
WEBHOOK_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$WEBHOOK_URL\"}")

if echo "$WEBHOOK_RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook đã được thiết lập thành công!"
    echo "🔗 Webhook URL: $WEBHOOK_URL"
else
    echo "❌ Lỗi khi thiết lập webhook:"
    echo "$WEBHOOK_RESPONSE"
    exit 1
fi

# Kiểm tra webhook
echo "🔍 Kiểm tra webhook..."
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")
echo "$WEBHOOK_INFO" | grep -o '"url":"[^"]*"'
echo "$WEBHOOK_INFO" | grep -o '"pending_update_count":[0-9]*'

echo ""
echo "🎉 Setup hoàn tất!"
echo "📱 Bot Telegram: @$BOT_USERNAME"
echo "🌐 Webhook: $WEBHOOK_URL"
echo ""
echo "💡 Bây giờ bạn có thể:"
echo "1. Tìm bot @$BOT_USERNAME trên Telegram"
echo "2. Gửi lệnh /start"
echo "3. Đăng ký tài khoản trên website"
echo "4. Liên kết Telegram trong Settings"
