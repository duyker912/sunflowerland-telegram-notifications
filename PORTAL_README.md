# 🌻 Sunflower Land Telegram Portal

Portal tùy chỉnh cho hệ thống thông báo Telegram của Sunflower Land.

## 🚀 Tính năng

### 📊 Dashboard
- Xem tổng quan cây trồng
- Thống kê cây sẵn sàng thu hoạch
- Trạng thái liên kết Telegram
- Đồng bộ dữ liệu từ game

### ⚙️ Cài đặt
- Liên kết tài khoản Telegram
- Bật/tắt thông báo thu hoạch
- Quản lý thông tin tài khoản

### 🔔 Thông báo
- Lịch sử thông báo
- Test thông báo
- Thống kê thông báo
- Hướng dẫn sử dụng bot

## 🛠️ Cài đặt

### 1. Clone Repository
```bash
git clone https://github.com/sunflower-land/sunflower-land.git
cd sunflower-land
```

### 2. Cài đặt Dependencies
```bash
yarn install
```

### 3. Cấu hình Environment
Tạo file `.env` từ `.env.portal`:
```bash
cp .env.portal .env
```

Cập nhật các biến môi trường:
```env
VITE_NETWORK=amoy
VITE_API_URL=https://sunflowerland-telegram-notifications-production.up.railway.app/api
VITE_PORTAL_APP=telegram-portal
```

### 4. Chạy Portal
```bash
yarn dev
```

Portal sẽ chạy tại: `http://localhost:3000`

## 📱 Sử dụng

### 1. Truy cập Portal
- Mở trình duyệt và truy cập `http://localhost:3000`
- Kết nối ví MetaMask
- Đăng nhập vào game Sunflower Land

### 2. Liên kết Telegram
- Vào tab "Cài đặt"
- Nhập username Telegram
- Click "Liên kết Telegram"

### 3. Bật thông báo
- Bật "Thông báo thu hoạch"
- Click "Cập nhật cài đặt"

### 4. Sử dụng Bot
- Tìm bot Telegram: `@sunflowerland_notifications_bot`
- Gửi lệnh `/start`
- Sử dụng `/link <email> <password>` để liên kết

## 🤖 Lệnh Bot Telegram

| Lệnh | Mô tả |
|------|-------|
| `/start` | Bắt đầu sử dụng bot |
| `/help` | Xem danh sách lệnh |
| `/link <email> <password>` | Liên kết tài khoản |
| `/unlink` | Hủy liên kết |
| `/status` | Kiểm tra trạng thái |
| `/crops` | Xem danh sách cây trồng |
| `/harvest` | Thu hoạch cây trồng |
| `/settings` | Cài đặt thông báo |

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user
- `POST /api/auth/telegram` - Liên kết Telegram
- `DELETE /api/auth/telegram` - Hủy liên kết

### Crops
- `GET /api/crops/user-crops` - Lấy danh sách cây trồng
- `POST /api/sunflower/sync/:farmId` - Đồng bộ dữ liệu

### Notifications
- `GET /api/notifications` - Lấy lịch sử thông báo
- `POST /api/test-notification` - Test thông báo
- `POST /api/test-harvest-notification/:userId` - Test thông báo thu hoạch

## 🏗️ Cấu trúc Project

```
src/features/portal/telegram/
├── TelegramPortal.tsx          # Component chính
├── components/
│   ├── TelegramDashboard.tsx   # Dashboard
│   ├── TelegramSettings.tsx    # Cài đặt
│   └── TelegramNotifications.tsx # Thông báo
└── lib/
    └── portalUtil.ts           # Utilities
```

## 🎨 Customization

### Thay đổi Theme
Chỉnh sửa CSS trong `TelegramPortal.tsx`:
```tsx
<div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-4 shadow-lg">
```

### Thêm tính năng mới
1. Tạo component mới trong `components/`
2. Import vào `TelegramPortal.tsx`
3. Thêm tab mới trong navigation

### Tích hợp API mới
1. Thêm endpoint vào backend
2. Cập nhật interface trong component
3. Gọi API trong useEffect

## 🐛 Troubleshooting

### Lỗi kết nối API
- Kiểm tra `VITE_API_URL` trong `.env`
- Đảm bảo backend đang chạy
- Kiểm tra CORS settings

### Lỗi Telegram Bot
- Kiểm tra `TELEGRAM_BOT_TOKEN`
- Đảm bảo bot đã được setup
- Kiểm tra webhook URL

### Lỗi Database
- Kiểm tra kết nối database
- Chạy migrations: `yarn db:migrate`
- Kiểm tra schema

## 📝 Development

### Chạy Tests
```bash
yarn test
```

### Build Production
```bash
yarn build
```

### Lint Code
```bash
yarn lint
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🆘 Support

- GitHub Issues: [Tạo issue](https://github.com/sunflower-land/sunflower-land/issues)
- Discord: [Sunflower Land Discord](https://discord.gg/sunflowerland)
- Email: support@sunflowerland.com

---

**🌻 Happy Farming! 🌻**
