# 🚀 Hướng dẫn Production Setup

## 📋 Tổng quan

Hệ thống hiện tại đang sử dụng **mock data** để test. Để chuyển sang **production** với API thật của Sunflower Land, cần thực hiện các bước sau:

## 🔧 Bước 1: Lấy JWT Token thật

### Cách 1: Sử dụng Browser Developer Tools

1. **Truy cập game**: [https://sunflowerland.io](https://sunflowerland.io)
2. **Đăng nhập** và chơi một chút để có dữ liệu
3. **Nhấn F12** → Console tab
4. **Gõ lệnh**:
```javascript
// Lấy JWT token
const jwt = localStorage.getItem('jwt') || sessionStorage.getItem('jwt');
console.log('JWT Token:', jwt);

// Copy token và sử dụng
```

### Cách 2: Sử dụng Chrome Android (Mobile)

1. **Mở Chrome** trên Android
2. **Truy cập game**: [https://sunflowerland.io](https://sunflowerland.io)
3. **Đăng nhập** và chơi
4. **Nhấn** vào thanh địa chỉ
5. **Gõ**: `javascript:console.log('JWT:', localStorage.getItem('jwt'));`
6. **Nhấn Enter** và copy token

### Cách 3: Sử dụng Bookmark

1. **Tạo bookmark** mới trong Chrome
2. **Đặt tên**: `Get JWT Token`
3. **Đặt URL**:
```javascript
javascript:(function(){const jwt=localStorage.getItem('jwt');if(jwt){prompt('JWT Token:',jwt);}else{alert('JWT token not found');}})();
```
4. **Lưu bookmark**
5. **Truy cập game** và **nhấn bookmark**

## 🔧 Bước 2: Cập nhật Environment Variables

### Trên Railway:

1. **Truy cập**: [Railway Dashboard](https://railway.app)
2. **Chọn project**: `sunflowerland-telegram-notifications`
3. **Vào tab Variables**
4. **Cập nhật**:
   ```
   SUNFLOWER_JWT_TOKEN=your_real_jwt_token_here
   ```
5. **Save** và **Redeploy**

### Trên Local:

1. **Cập nhật** `server/env.production`:
   ```
   SUNFLOWER_JWT_TOKEN=your_real_jwt_token_here
   ```

## 🔧 Bước 3: Chuyển sang API thật

### Cập nhật SunflowerLandService:

1. **Mở** `server/services/sunflowerLandService.js`
2. **Thay đổi**:
   ```javascript
   this.useMockData = false; // Chuyển từ true sang false
   ```

### Cập nhật Portal Service:

1. **Mở** `server/services/portalService.js`
2. **Thêm** method để chuyển sang API thật:
   ```javascript
   // Thêm vào constructor
   this.useRealAPI = process.env.SUNFLOWER_JWT_TOKEN && process.env.SUNFLOWER_JWT_TOKEN !== 'your_jwt_token_here';
   ```

## 🔧 Bước 4: Test API thật

### Test Connection:

```bash
curl -X GET "https://sunflowerland-telegram-notifications-production.up.railway.app/api/test-sunflower"
```

### Test Player Data:

```bash
curl -X GET "https://sunflowerland-telegram-notifications-production.up.railway.app/api/sunflower/player/2749154680612546/crops"
```

### Test Sync:

```bash
curl -X POST "https://sunflowerland-telegram-notifications-production.up.railway.app/api/sunflower/sync/2749154680612546"
```

## 🔧 Bước 5: Cấu hình Telegram Bot

### Tạo Telegram Bot:

1. **Tìm** [@BotFather](https://t.me/botfather) trên Telegram
2. **Gõ** `/newbot`
3. **Đặt tên**: `Sunflower Land Notifications`
4. **Đặt username**: `sunflowerland_notifications_bot`
5. **Copy token** và cập nhật:
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

### Cấu hình Webhook:

1. **Cập nhật** webhook URL:
   ```
   TELEGRAM_WEBHOOK_URL=https://sunflowerland-telegram-notifications-production.up.railway.app/api/telegram/webhook
   ```

2. **Set webhook**:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://sunflowerland-telegram-notifications-production.up.railway.app/api/telegram/webhook"}'
   ```

## 🔧 Bước 6: Cấu hình Database

### Kiểm tra Schema:

```bash
curl -X GET "https://sunflowerland-telegram-notifications-production.up.railway.app/api/check-schema"
```

### Chạy Migrations:

```bash
# Trên Railway, migrations sẽ tự động chạy khi deploy
# Hoặc chạy manual:
curl -X POST "https://sunflowerland-telegram-notifications-production.up.railway.app/api/run-migrations"
```

## 🔧 Bước 7: Test toàn bộ hệ thống

### Test Frontend:

1. **Truy cập**: [https://sunflowerland-telegram-notifications-production.up.railway.app](https://sunflowerland-telegram-notifications-production.up.railway.app)
2. **Đăng nhập** với tài khoản admin
3. **Kiểm tra** dashboard hiển thị dữ liệu thật
4. **Test** nút "Làm mới" để sync dữ liệu
5. **Test** nút "Test Thông báo" để gửi thông báo Telegram

### Test Telegram Bot:

1. **Tìm bot** trên Telegram: `@sunflowerland_notifications_bot`
2. **Gõ** `/start`
3. **Liên kết** tài khoản với bot
4. **Test** thông báo harvest

## 🔧 Bước 8: Monitoring và Maintenance

### Health Check:

```bash
curl -X GET "https://sunflowerland-telegram-notifications-production.up.railway.app/health"
```

### Logs:

- **Railway Dashboard** → **Deployments** → **View Logs**
- **Kiểm tra** cron jobs, API calls, errors

### Performance:

- **Monitor** response times
- **Check** database performance
- **Optimize** API calls nếu cần

## 🚨 Troubleshooting

### Lỗi thường gặp:

1. **JWT Token hết hạn**:
   - Lấy token mới từ game
   - Cập nhật environment variable
   - Redeploy

2. **API Connection failed**:
   - Kiểm tra JWT token
   - Kiểm tra network connectivity
   - Check API endpoint

3. **Telegram Bot không hoạt động**:
   - Kiểm tra bot token
   - Kiểm tra webhook URL
   - Test webhook endpoint

4. **Database errors**:
   - Kiểm tra schema
   - Chạy migrations
   - Check connection string

## 📊 Production Checklist

- [ ] JWT Token thật đã được cập nhật
- [ ] `useMockData = false` trong SunflowerLandService
- [ ] Telegram Bot đã được tạo và cấu hình
- [ ] Webhook đã được set
- [ ] Database schema đã được cập nhật
- [ ] Frontend hiển thị dữ liệu thật
- [ ] Notification system hoạt động
- [ ] Cron jobs chạy đúng
- [ ] Health check OK
- [ ] Monitoring setup

## 🎯 Kết quả mong đợi

Sau khi hoàn thành, hệ thống sẽ:

- ✅ **Lấy dữ liệu thật** từ Sunflower Land game
- ✅ **Sync tự động** dữ liệu cây trồng
- ✅ **Gửi thông báo** khi cây sẵn sàng thu hoạch
- ✅ **Dashboard real-time** với dữ liệu thật
- ✅ **Telegram bot** hoạt động hoàn hảo
- ✅ **Production ready** và stable

## 🚀 Next Steps

1. **Monitor** hệ thống trong vài ngày
2. **Collect feedback** từ users
3. **Optimize** performance nếu cần
4. **Add features** mới theo yêu cầu
5. **Scale** hệ thống khi cần thiết

---

**Chúc bạn thành công với hệ thống Sunflower Land Telegram Notifications!** 🌻🚀
