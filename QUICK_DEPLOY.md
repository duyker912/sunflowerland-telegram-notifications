# ⚡ Deploy Nhanh - 5 Phút

## 🎯 Mục tiêu
Deploy hệ thống Sunflower Land Telegram Notifications hoàn toàn miễn phí trong 5 phút!

## 📋 Checklist Nhanh

### ✅ Bước 1: Tạo Telegram Bot (1 phút)
1. Mở Telegram → Tìm [@BotFather](https://t.me/botfather)
2. Gửi `/newbot`
3. Đặt tên: `Sunflower Land Notifications`
4. Username: `sunflowerland_notify_bot` (hoặc tên khác)
5. **Lưu lại Bot Token** (dạng: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### ✅ Bước 2: Setup Database (2 phút)
1. Truy cập [supabase.com](https://supabase.com) → Đăng ký
2. **New Project** → Tên: `sunflowerland-db`
3. Tạo password mạnh → **Create project**
4. Vào **SQL Editor** → Copy/paste nội dung file `deploy-scripts/setup-supabase.sql`
5. **Run** → Lưu thông tin kết nối:
   - Host: `db.xxx.supabase.co`
   - Database: `postgres`
   - User: `postgres`
   - Password: (password bạn tạo)

### ✅ Bước 3: Deploy Backend (1 phút)
1. Truy cập [railway.app](https://railway.app) → Đăng nhập GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Chọn repo → Chọn thư mục `server/`
4. **Variables** → Thêm:
```env
NODE_ENV=production
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
CORS_ORIGIN=https://your-vercel-app.vercel.app
```
5. **Deploy** → Lưu URL (dạng: `https://your-app.railway.app`)

### ✅ Bước 4: Deploy Frontend (1 phút)
1. Truy cập [vercel.com](https://vercel.com) → Đăng nhập GitHub
2. **New Project** → Import repo
3. Chọn thư mục `client/`
4. **Environment Variables** → Thêm:
```env
REACT_APP_API_URL=https://sunflowerland-telegram-notifications-production.up.railway.app/api
```
5. **Deploy** → Lưu URL (dạng: `https://your-app.vercel.app`)

### ✅ Bước 5: Setup Telegram Webhook (30 giây)
1. Mở Command Prompt/Terminal
2. Chạy script:
```bash
# Windows
deploy-scripts\telegram-setup.bat YOUR_BOT_TOKEN https://sunflowerland-telegram-notifications-production.up.railway.app

# Linux/Mac
./deploy-scripts/telegram-setup.sh YOUR_BOT_TOKEN https://sunflowerland-telegram-notifications-production.up.railway.app
```

## 🎉 Hoàn thành!

Bây giờ bạn có:
- 🌐 **Website**: https://your-app.vercel.app
- 🔗 **API**: https://sunflowerland-telegram-notifications-production.up.railway.app
- 🤖 **Telegram Bot**: @your_bot_username
- 🗄️ **Database**: Supabase dashboard

## 🧪 Test Nhanh

1. **Test Website**: Truy cập URL Vercel → Đăng ký tài khoản
2. **Test Bot**: Tìm bot trên Telegram → `/start`
3. **Test Thông báo**: Liên kết Telegram → Trồng cây → Chờ thông báo

## 🆘 Nếu gặp lỗi

### Backend không chạy
- Kiểm tra **Variables** trên Railway
- Xem **Logs** trong Railway dashboard

### Frontend không kết nối
- Kiểm tra `REACT_APP_API_URL` trên Vercel
- Kiểm tra `CORS_ORIGIN` trên Railway

### Telegram Bot không hoạt động
- Kiểm tra webhook: `https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo`
- Reset webhook: `https://api.telegram.org/botYOUR_TOKEN/deleteWebhook`

## 💰 Chi phí: **HOÀN TOÀN MIỄN PHÍ**

- ✅ Vercel: Free (100GB/tháng)
- ✅ Railway: Free (500 giờ/tháng)  
- ✅ Supabase: Free (500MB database)
- ✅ Telegram: Free
- ✅ GitHub: Free

---

**🚀 Chúc bạn deploy thành công!**
