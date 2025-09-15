# 🚀 Quick Start - Sunflower Land API

## ⚡ Hướng dẫn nhanh (5 phút)

### 1. Lấy JWT Token (2 phút)

1. **Mở game**: [https://sunflowerland.io](https://sunflowerland.io)
2. **Đăng nhập** và chơi một chút
3. **Nhấn F12** → Console tab
4. **Gõ lệnh**:
```javascript
const jwt = localStorage.getItem('jwt') || sessionStorage.getItem('jwt');
console.log('JWT Token:', jwt);
```
5. **Copy JWT token** từ console

### 2. Lấy Player ID (1 phút)

1. **Trong Console**, gõ:
```javascript
const playerId = window.gameState?.playerId || localStorage.getItem('playerId');
console.log('Player ID:', playerId);
```
2. **Copy Player ID** từ console

### 3. Cấu hình Railway (1 phút)

1. **Truy cập**: [Railway Dashboard](https://railway.app)
2. **Chọn project** → Variables tab
3. **Thêm**:
   - `SUNFLOWER_JWT_TOKEN` = `your_jwt_token_here`
4. **Save** và **Redeploy**

### 4. Test API (1 phút)

```bash
# Test connection
curl "https://sunflowerland-telegram-notifications-production.up.railway.app/api/test-sunflower"

# Link player ID
curl -X POST "https://sunflowerland-telegram-notifications-production.up.railway.app/api/sunflower/link-player" \
  -H "Content-Type: application/json" \
  -d '{"playerId": "YOUR_PLAYER_ID"}'
```

## ✅ Xong! Bây giờ bạn có thể:

- ✅ **Nhận thông báo** khi cây sẵn sàng thu hoạch
- ✅ **Theo dõi** tiến độ cây trồng real-time
- ✅ **Sync dữ liệu** từ game vào database
- ✅ **Sử dụng** tất cả tính năng của hệ thống

## 🔧 Nếu gặp lỗi:

1. **JWT token hết hạn** → Lấy token mới từ game
2. **Player not found** → Kiểm tra Player ID có đúng không
3. **API connection failed** → Kiểm tra environment variables

## 📞 Cần hỗ trợ?

- **Chi tiết**: Xem `SUNFLOWER_API_SETUP.md`
- **Discord**: [Sunflower Land Discord](https://discord.gg/sunflowerland)
- **Docs**: [Sunflower Land Docs](https://docs.sunflower-land.com/)
