# 🚀 Hướng dẫn Deploy Miễn phí 100%

## 🎯 Tổng quan Deploy

Chúng ta sẽ sử dụng các dịch vụ miễn phí sau:
- **Frontend**: Vercel (Free)
- **Backend**: Railway (Free tier)
- **Database**: Supabase (Free tier)
- **Telegram Bot**: Free (chỉ cần token)

## 📋 Chuẩn bị

### 1. Tạo tài khoản miễn phí
- [Vercel](https://vercel.com) - Deploy Frontend
- [Railway](https://railway.app) - Deploy Backend
- [Supabase](https://supabase.com) - Database
- [GitHub](https://github.com) - Lưu trữ code

### 2. Tạo Telegram Bot
```bash
# Tìm @BotFather trên Telegram
/newbot
# Đặt tên: Sunflower Land Notifications
# Username: sunflowerland_notify_bot
# Lưu lại Bot Token
```

## 🗄️ Bước 1: Setup Database (Supabase)

### 1.1 Tạo Project Supabase
1. Truy cập [supabase.com](https://supabase.com)
2. Đăng ký/Đăng nhập
3. Click "New Project"
4. Chọn "Start your project"
5. Đặt tên: `sunflowerland-db`
6. Tạo password mạnh cho database
7. Chọn region gần nhất (Singapore cho VN)
8. Click "Create new project"

### 1.2 Lấy thông tin kết nối
1. Vào **Settings** → **Database**
2. Copy các thông tin:
   - **Host**: `db.xxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (password bạn đã tạo)

### 1.3 Tạo bảng trong Supabase
1. Vào **SQL Editor**
2. Chạy script sau:

```sql
-- Tạo bảng users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telegram_chat_id VARCHAR(50) UNIQUE,
    telegram_username VARCHAR(50),
    telegram_linked BOOLEAN DEFAULT FALSE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    notification_settings JSONB DEFAULT '{}',
    last_login TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tạo bảng crops
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    grow_time INTEGER NOT NULL,
    harvest_time INTEGER NOT NULL,
    sell_price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tạo bảng user_crops
CREATE TABLE user_crops (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    planted_at TIMESTAMP,
    harvest_ready_at TIMESTAMP,
    is_harvested BOOLEAN DEFAULT FALSE,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tạo bảng notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    scheduled_for TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tạo indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram_chat_id ON users(telegram_chat_id);
CREATE INDEX idx_crops_type ON crops(type);
CREATE INDEX idx_crops_is_active ON crops(is_active);
CREATE INDEX idx_user_crops_user_id ON user_crops(user_id);
CREATE INDEX idx_user_crops_harvest_ready_at ON user_crops(harvest_ready_at);
CREATE INDEX idx_user_crops_is_harvested ON user_crops(is_harvested);
CREATE INDEX idx_user_crops_notification_sent ON user_crops(notification_sent);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_sent ON notifications(sent);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);
```

### 1.4 Thêm dữ liệu mẫu
```sql
-- Thêm crops mẫu
INSERT INTO crops (name, type, grow_time, harvest_time, sell_price, description) VALUES
('Sunflower', 'crop', 60, 60, 0.02, 'Cây hướng dương cơ bản'),
('Potato', 'crop', 300, 300, 0.14, 'Khoai tây, thời gian phát triển trung bình'),
('Pumpkin', 'crop', 1800, 1800, 0.8, 'Bí ngô, cần thời gian phát triển lâu'),
('Carrot', 'crop', 60, 60, 0.02, 'Cà rốt, cây trồng cơ bản'),
('Cabbage', 'crop', 900, 900, 0.4, 'Bắp cải, thời gian phát triển dài'),
('Apple Tree', 'tree', 3600, 3600, 1.5, 'Cây táo, cần thời gian phát triển rất lâu'),
('Blueberry Bush', 'bush', 1800, 1800, 0.8, 'Bụi việt quất, thời gian phát triển dài');
```

## 🚂 Bước 2: Deploy Backend (Railway)

### 2.1 Chuẩn bị code
1. Tạo file `railway.json` trong thư mục `server/`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. Tạo file `Procfile` trong thư mục `server/`:
```
web: npm start
```

3. Cập nhật `server/package.json`:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

### 2.2 Deploy lên Railway
1. Truy cập [railway.app](https://railway.app)
2. Đăng nhập bằng GitHub
3. Click "New Project"
4. Chọn "Deploy from GitHub repo"
5. Chọn repository của bạn
6. Chọn thư mục `server/`
7. Railway sẽ tự động build và deploy

### 2.3 Cấu hình Environment Variables
1. Vào project trên Railway
2. Click **Variables** tab
3. Thêm các biến:

```env
NODE_ENV=production
PORT=5000

# Database (Supabase)
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_WEBHOOK_URL=https://sunflowerland-telegram-notifications-production.up.railway.app/api/telegram/webhook

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### 2.4 Lấy URL Backend
1. Railway sẽ cung cấp URL như: `https://your-app.railway.app`
2. Copy URL này để dùng cho Frontend

## ⚡ Bước 3: Deploy Frontend (Vercel)

### 3.1 Chuẩn bị code
1. Tạo file `vercel.json` trong thư mục `client/`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

2. Tạo file `.env.production` trong thư mục `client/`:
```env
REACT_APP_API_URL=https://sunflowerland-telegram-notifications-production.up.railway.app/api
```

### 3.2 Deploy lên Vercel
1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập bằng GitHub
3. Click "New Project"
4. Import repository của bạn
5. Chọn thư mục `client/`
6. Cấu hình:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
7. Click "Deploy"

### 3.3 Cấu hình Environment Variables
1. Vào project trên Vercel
2. Click **Settings** → **Environment Variables**
3. Thêm:
```env
REACT_APP_API_URL=https://sunflowerland-telegram-notifications-production.up.railway.app/api
```

## 🔗 Bước 4: Cấu hình Telegram Webhook

### 4.1 Set Webhook
```bash
# Thay YOUR_BOT_TOKEN và YOUR_RAILWAY_URL
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://sunflowerland-telegram-notifications-production.up.railway.app/api/telegram/webhook"}'
```

### 4.2 Kiểm tra Webhook
```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

## 🎉 Bước 5: Test Hệ thống

### 5.1 Test Backend
```bash
# Health check
curl https://sunflowerland-telegram-notifications-production.up.railway.app/health

# Test API
curl https://sunflowerland-telegram-notifications-production.up.railway.app/api/crops
```

### 5.2 Test Frontend
1. Truy cập URL Vercel của bạn
2. Đăng ký tài khoản mới
3. Test các tính năng

### 5.3 Test Telegram Bot
1. Tìm bot trên Telegram
2. Gửi `/start`
3. Đăng ký và liên kết tài khoản
4. Test thông báo

## 📊 Monitoring & Logs

### Railway Logs
1. Vào project trên Railway
2. Click **Deployments** tab
3. Click vào deployment mới nhất
4. Xem logs real-time

### Vercel Analytics
1. Vào project trên Vercel
2. Click **Analytics** tab
3. Xem thống kê traffic

### Supabase Dashboard
1. Vào project trên Supabase
2. **Table Editor**: Xem dữ liệu
3. **Logs**: Xem query logs
4. **API**: Test API endpoints

## 🔧 Troubleshooting

### Backend không chạy
```bash
# Kiểm tra logs trên Railway
# Kiểm tra environment variables
# Kiểm tra database connection
```

### Frontend không kết nối Backend
```bash
# Kiểm tra CORS_ORIGIN
# Kiểm tra REACT_APP_API_URL
# Kiểm tra network tab trong browser
```

### Telegram Bot không hoạt động
```bash
# Kiểm tra webhook
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"

# Reset webhook
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook"
```

## 💰 Chi phí

**Hoàn toàn MIỄN PHÍ:**
- ✅ Vercel: Free tier (100GB bandwidth/tháng)
- ✅ Railway: Free tier (500 giờ/tháng)
- ✅ Supabase: Free tier (500MB database)
- ✅ Telegram Bot: Hoàn toàn miễn phí
- ✅ GitHub: Free cho public repos

## 🚀 Tối ưu hóa

### 1. Custom Domain (Miễn phí)
- Vercel: Thêm custom domain
- Railway: Upgrade để có custom domain

### 2. SSL Certificate
- Tự động có SSL với Vercel và Railway

### 3. CDN
- Vercel tự động có CDN global

### 4. Auto Deploy
- Tự động deploy khi push code lên GitHub

## 📱 Kết quả

Sau khi deploy thành công, bạn sẽ có:
- 🌐 **Website**: https://your-app.vercel.app
- 🔗 **API**: https://sunflowerland-telegram-notifications-production.up.railway.app
- 🤖 **Telegram Bot**: @your_bot_username
- 🗄️ **Database**: Supabase dashboard

**Tất cả hoàn toàn MIỄN PHÍ và sẵn sàng sử dụng!** 🎉

---

**Lưu ý**: Các dịch vụ free có giới hạn, nhưng đủ cho việc phát triển và test. Khi cần scale, có thể upgrade với chi phí rất thấp.
