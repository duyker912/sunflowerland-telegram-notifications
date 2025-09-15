@echo off
REM Script để setup Telegram Bot Webhook trên Windows
REM Sử dụng: telegram-setup.bat YOUR_BOT_TOKEN YOUR_RAILWAY_URL

set BOT_TOKEN=%1
set RAILWAY_URL=%2

if "%BOT_TOKEN%"=="" (
    echo ❌ Sử dụng: telegram-setup.bat YOUR_BOT_TOKEN YOUR_RAILWAY_URL
    echo Ví dụ: telegram-setup.bat 123456789:ABCdefGHIjklMNOpqrsTUVwxyz https://your-app.railway.app
    exit /b 1
)

if "%RAILWAY_URL%"=="" (
    echo ❌ Sử dụng: telegram-setup.bat YOUR_BOT_TOKEN YOUR_RAILWAY_URL
    echo Ví dụ: telegram-setup.bat 123456789:ABCdefGHIjklMNOpqrsTUVwxyz https://your-app.railway.app
    exit /b 1
)

echo 🤖 Setting up Telegram Bot...
echo Bot Token: %BOT_TOKEN:~0,10%...
echo Railway URL: %RAILWAY_URL%

REM Kiểm tra bot token
echo 📡 Kiểm tra bot token...
curl -s "https://api.telegram.org/bot%BOT_TOKEN%/getMe" > temp_bot_info.json
findstr /C:"\"ok\":true" temp_bot_info.json >nul
if %errorlevel% equ 0 (
    for /f "tokens=2 delims=:" %%a in ('findstr /C:"\"username\":" temp_bot_info.json') do (
        set BOT_USERNAME=%%a
        set BOT_USERNAME=!BOT_USERNAME:"=!
        set BOT_USERNAME=!BOT_USERNAME:,=!
    )
    echo ✅ Bot token hợp lệ. Username: @!BOT_USERNAME!
) else (
    echo ❌ Bot token không hợp lệ!
    del temp_bot_info.json
    exit /b 1
)
del temp_bot_info.json

REM Xóa webhook cũ
echo 🗑️ Xóa webhook cũ...
curl -s -X POST "https://api.telegram.org/bot%BOT_TOKEN%/deleteWebhook"

REM Set webhook mới
echo 🔗 Thiết lập webhook mới...
set WEBHOOK_URL=%RAILWAY_URL%/api/telegram/webhook
curl -s -X POST "https://api.telegram.org/bot%BOT_TOKEN%/setWebhook" -H "Content-Type: application/json" -d "{\"url\": \"%WEBHOOK_URL%\"}" > temp_webhook_response.json

findstr /C:"\"ok\":true" temp_webhook_response.json >nul
if %errorlevel% equ 0 (
    echo ✅ Webhook đã được thiết lập thành công!
    echo 🔗 Webhook URL: %WEBHOOK_URL%
) else (
    echo ❌ Lỗi khi thiết lập webhook:
    type temp_webhook_response.json
    del temp_webhook_response.json
    exit /b 1
)
del temp_webhook_response.json

REM Kiểm tra webhook
echo 🔍 Kiểm tra webhook...
curl -s "https://api.telegram.org/bot%BOT_TOKEN%/getWebhookInfo" > temp_webhook_info.json
findstr /C:"\"url\":" temp_webhook_info.json
findstr /C:"\"pending_update_count\":" temp_webhook_info.json
del temp_webhook_info.json

echo.
echo 🎉 Setup hoàn tất!
echo 📱 Bot Telegram: @!BOT_USERNAME!
echo 🌐 Webhook: %WEBHOOK_URL%
echo.
echo 💡 Bây giờ bạn có thể:
echo 1. Tìm bot @!BOT_USERNAME! trên Telegram
echo 2. Gửi lệnh /start
echo 3. Đăng ký tài khoản trên website
echo 4. Liên kết Telegram trong Settings
