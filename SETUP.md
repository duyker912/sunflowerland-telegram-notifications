# 🚀 Hướng dẫn Setup Hệ thống Thông báo Telegram

## 📋 Yêu cầu Hệ thống

- **Node.js**: 18.0.0 trở lên
- **PostgreSQL**: 14.0 trở lên
- **npm**: 8.0.0 trở lên
- **Telegram Bot Token**: Từ [@BotFather](https://t.me/botfather)

## 🛠️ Cài đặt

### 1. Clone và Cài đặt Dependencies

```bash
# Clone repository
git clone <repository-url>
cd sunflowerland-telegram-notifications

# Cài đặt tất cả dependencies
npm run install:all
```

### 2. Cấu hình Database

#### Tạo Database PostgreSQL
```sql
-- Kết nối PostgreSQL và tạo database
CREATE DATABASE sunflowerland_db;
CREATE USER sunflowerland_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sunflowerland_db TO sunflowerland_user;
```

#### Cấu hình Environment Variables
```bash
# Copy file cấu hình
cp server/env.example server/.env

# Chỉnh sửa file .env với thông tin của bạn
```

**Nội dung file `server/.env`:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sunflowerland_db
DB_USER=sunflowerland_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook

# Sunflower Land API (nếu có)
SUNFLOWER_API_URL=https://api.sunflowerland.io
SUNFLOWER_API_KEY=your_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Khởi tạo Database

```bash
cd server

# Chạy migrations
npm run db:migrate

# Chạy seeds (dữ liệu mẫu)
npm run db:seed
```

### 4. Tạo Telegram Bot

1. **Tạo Bot mới:**
   - Mở Telegram và tìm [@BotFather](https://t.me/botfather)
   - Gửi lệnh `/newbot`
   - Đặt tên cho bot (ví dụ: "Sunflower Land Notifications")
   - Đặt username cho bot (ví dụ: "sunflowerland_notify_bot")
   - Lưu lại **Bot Token**

2. **Cấu hình Bot:**
   ```bash
   # Gửi các lệnh sau cho @BotFather
   /setdescription - Đặt mô tả bot
   /setabouttext - Đặt thông tin về bot
   /setuserpic - Đặt avatar cho bot
   /setcommands - Đặt danh sách lệnh
   ```

3. **Cập nhật Bot Token:**
   - Thêm token vào file `server/.env`
   - `TELEGRAM_BOT_TOKEN=your_actual_bot_token_here`

### 5. Chạy Ứng dụng

#### Development Mode
```bash
# Chạy cả Frontend và Backend
npm run dev

# Hoặc chạy riêng lẻ
# Backend
cd server && npm run dev

# Frontend
cd client && npm start
```

#### Production Mode
```bash
# Build Frontend
npm run build

# Start Backend
npm start
```

## 🌐 Truy cập Ứng dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📱 Sử dụng Telegram Bot

1. **Tìm bot trên Telegram** bằng username đã tạo
2. **Bắt đầu chat** với bot bằng lệnh `/start`
3. **Đăng ký tài khoản** trên website
4. **Liên kết Telegram** trong phần Settings
5. **Trồng cây** và nhận thông báo tự động!

## 🔧 Cấu hình Nâng cao

### Webhook cho Telegram (Production)

```bash
# Set webhook cho bot
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/api/telegram/webhook"}'
```

### SSL Certificate (Production)

```bash
# Sử dụng Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

### Environment Variables (Production)

```bash
# Cấu hình production
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PASSWORD=your_secure_password
JWT_SECRET=your_very_secure_jwt_secret
TELEGRAM_BOT_TOKEN=your_bot_token
CORS_ORIGIN=https://yourdomain.com
```

## 🐛 Troubleshooting

### Lỗi Database Connection
```bash
# Kiểm tra PostgreSQL đang chạy
sudo systemctl status postgresql

# Kiểm tra kết nối
psql -h localhost -U sunflowerland_user -d sunflowerland_db
```

### Lỗi Telegram Bot
```bash
# Kiểm tra bot token
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"

# Kiểm tra webhook
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### Lỗi CORS
```bash
# Kiểm tra CORS_ORIGIN trong .env
# Đảm bảo frontend URL đúng
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs
```bash
# Backend logs
cd server && npm run dev

# Database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 🔐 Security

1. **Đổi mật khẩu mặc định** của database
2. **Sử dụng JWT secret mạnh** (ít nhất 32 ký tự)
3. **Cấu hình firewall** cho production
4. **Sử dụng HTTPS** cho production
5. **Backup database** định kỳ

## 📈 Performance

1. **Database Indexing**: Đã được cấu hình sẵn
2. **Rate Limiting**: 100 requests/15 phút
3. **Caching**: Có thể thêm Redis nếu cần
4. **Load Balancing**: Sử dụng PM2 cho production

## 🆘 Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs của server
2. Database connection
3. Telegram bot token
4. Environment variables
5. Network connectivity

---

**Chúc bạn setup thành công! 🌻**
