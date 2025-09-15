# 🌻 Sunflower Land - Telegram Notifications

Hệ thống thông báo thu hoạch qua Telegram cho game Sunflower Land.

## 🚀 Tính năng

- 📱 Thông báo thu hoạch tự động qua Telegram
- ⚙️ Quản lý cài đặt thông báo linh hoạt
- 🎮 Tích hợp với game Sunflower Land
- 📊 Dashboard quản lý cho admin
- 🔔 Hỗ trợ nhiều loại cây trồng

## 🏗️ Kiến trúc

```
Frontend (React) ←→ Backend API (Node.js) ←→ Telegram Bot
                           ↓
                    Database (PostgreSQL)
```

## 📋 Yêu cầu Hệ thống

- Node.js 18+
- PostgreSQL 14+
- Telegram Bot Token

## 🛠️ Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd sunflowerland-telegram-notifications
```

2. **Cài đặt dependencies**
```bash
npm run install:all
```

3. **Cấu hình môi trường**
```bash
# Copy file cấu hình
cp server/.env.example server/.env
cp client/.env.example client/.env

# Chỉnh sửa các biến môi trường
```

4. **Khởi tạo database**
```bash
cd server
npm run db:migrate
npm run db:seed
```

5. **Chạy ứng dụng**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📱 Sử dụng Telegram Bot

1. Tạo bot mới với [@BotFather](https://t.me/botfather)
2. Lấy Bot Token
3. Cấu hình trong file `.env`
4. Bắt đầu chat với bot và sử dụng lệnh `/start`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/telegram` - Liên kết Telegram

### Notifications
- `GET /api/notifications` - Lấy danh sách thông báo
- `POST /api/notifications` - Tạo thông báo mới
- `PUT /api/notifications/:id` - Cập nhật thông báo
- `DELETE /api/notifications/:id` - Xóa thông báo

### Crops
- `GET /api/crops` - Lấy danh sách cây trồng
- `GET /api/crops/:id/harvest-time` - Lấy thời gian thu hoạch

## 🎨 Frontend

Giao diện React với các tính năng:
- Đăng nhập/Đăng ký
- Quản lý thông báo
- Dashboard admin
- Cài đặt Telegram

## 🤖 Telegram Bot Commands

- `/start` - Bắt đầu sử dụng bot
- `/help` - Hiển thị trợ giúp
- `/settings` - Cài đặt thông báo
- `/status` - Kiểm tra trạng thái
- `/unlink` - Hủy liên kết tài khoản

## 📄 License

MIT License
