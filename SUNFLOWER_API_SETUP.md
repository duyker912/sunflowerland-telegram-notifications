# 🌻 Hướng dẫn chi tiết lấy JWT Token từ Sunflower Land

## 📋 Tổng quan

Sunflower Land sử dụng **JWT Token** thay vì API key truyền thống để xác thực. JWT token này được cung cấp thông qua URL parameter khi người chơi truy cập portal.

## 🔑 Cách lấy JWT Token - Hướng dẫn từng bước

### Bước 1: Truy cập Sunflower Land Game

1. **Mở trình duyệt** và truy cập: [https://sunflowerland.io](https://sunflowerland.io)
2. **Kết nối ví** (MetaMask, WalletConnect, etc.)
3. **Đăng nhập** vào game và chơi một chút để có dữ liệu

### Bước 2: Tạo Portal trên Sunflower Land

1. **Truy cập**: [Sunflower Land Developer Portal](https://docs.sunflower-land.com/contributing/portals/portal-apis)
2. **Đăng ký** tài khoản developer nếu chưa có
3. **Tạo portal mới** với thông tin:
   - Portal Name: `Sunflower Land Telegram Bot`
   - Description: `Telegram notification system for harvest reminders`
   - Redirect URL: `https://your-domain.com/auth/sunflower/callback`

### Bước 3: Lấy JWT Token từ Game

#### Cách 1: Sử dụng Browser Developer Tools (Desktop)

1. **Mở game** trong trình duyệt: [https://sunflowerland.io](https://sunflowerland.io)
2. **Nhấn F12** để mở Developer Tools
3. **Chuyển sang tab Console**
4. **Gõ lệnh** sau để lấy JWT token:

```javascript
// Lấy JWT token từ localStorage
const jwt = localStorage.getItem('jwt');
console.log('JWT Token:', jwt);

// Hoặc lấy từ sessionStorage
const sessionJwt = sessionStorage.getItem('jwt');
console.log('Session JWT Token:', sessionJwt);

// Hoặc lấy từ cookies
const cookies = document.cookie;
console.log('Cookies:', cookies);
```

#### Cách 1b: Sử dụng Chrome Android (Mobile)

1. **Mở Chrome** trên Android
2. **Truy cập game**: [https://sunflowerland.io](https://sunflowerland.io)
3. **Đăng nhập** và chơi một chút
4. **Bật Developer Tools**:
   - **Nhấn** vào thanh địa chỉ
   - **Gõ**: `chrome://inspect`
   - **Nhấn Enter**
5. **Kết nối** với máy tính qua USB hoặc WiFi
6. **Mở Console** từ máy tính
7. **Gõ lệnh** tương tự như trên

**Hoặc sử dụng Chrome Remote Debugging:**

1. **Trên máy tính**, mở Chrome
2. **Gõ**: `chrome://inspect/#devices`
3. **Kết nối** điện thoại qua USB
4. **Bật USB Debugging** trên điện thoại
5. **Chọn** tab của Sunflower Land
6. **Mở Console** và gõ lệnh

#### Cách 2: Sử dụng Network Tab (Desktop)

1. **Mở Developer Tools** (F12)
2. **Chuyển sang tab Network**
3. **Refresh trang** game
4. **Tìm request** có chứa JWT token trong headers
5. **Copy token** từ Authorization header

#### Cách 2b: Sử dụng Network Tab (Chrome Android)

1. **Mở Chrome** trên Android
2. **Truy cập game**: [https://sunflowerland.io](https://sunflowerland.io)
3. **Kết nối** với máy tính qua USB
4. **Trên máy tính**, mở `chrome://inspect/#devices`
5. **Chọn** tab của Sunflower Land
6. **Mở Network tab** từ máy tính
7. **Refresh** game trên điện thoại
8. **Tìm request** có chứa JWT token
9. **Copy token** từ Authorization header

#### Cách 3: Sử dụng Portal URL

1. **Tạo portal** trên Sunflower Land Developer Portal
2. **Lấy portal URL** từ dashboard
3. **Truy cập portal URL** với JWT parameter:
   ```
   https://your-portal.sunflower-land.com/?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Copy JWT token** từ URL parameter

#### Cách 4: Sử dụng Chrome Android (Không cần máy tính)

**Phương pháp đơn giản nhất cho mobile:**

1. **Mở Chrome** trên Android
2. **Truy cập game**: [https://sunflowerland.io](https://sunflowerland.io)
3. **Đăng nhập** và chơi một chút
4. **Nhấn** vào thanh địa chỉ
5. **Gõ**: `javascript:console.log('JWT:', localStorage.getItem('jwt'));`
6. **Nhấn Enter**
7. **Xem kết quả** trong console
8. **Copy JWT token** từ kết quả

**Hoặc sử dụng Bookmark:**

1. **Tạo bookmark** mới trong Chrome
2. **Đặt tên**: `Get JWT Token`
3. **Đặt URL**:
   ```javascript
   javascript:(function(){const jwt=localStorage.getItem('jwt');if(jwt){prompt('JWT Token:',jwt);}else{alert('JWT token not found');}})();
   ```
4. **Lưu bookmark**
5. **Truy cập game** và **nhấn bookmark**
6. **Copy JWT token** từ popup

### Bước 4: Cấu hình Environment Variables

Thêm vào file `.env` hoặc `env.production`:

```env
# Sunflower Land API Configuration
SUNFLOWER_API_URL=https://api.sunflowerland.io
SUNFLOWER_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # JWT token từ portal
```

#### Cấu hình trên Railway:

1. **Truy cập** Railway Dashboard: [https://railway.app](https://railway.app)
2. **Chọn project** `sunflowerland-telegram-notifications`
3. **Vào tab Variables**
4. **Thêm biến môi trường**:
   - `SUNFLOWER_API_URL` = `https://api.sunflowerland.io`
   - `SUNFLOWER_JWT_TOKEN` = `your_jwt_token_here` (thay bằng JWT token thật)
5. **Save** và **Redeploy** project

## 🚀 Cách sử dụng - Hướng dẫn chi tiết

### 1. Test API Connection

**Sử dụng curl:**
```bash
curl -X GET "https://sunflowerland-telegram-notifications-production.up.railway.app/api/test-sunflower"
```

**Sử dụng PowerShell:**
```powershell
Invoke-WebRequest -Uri "https://sunflowerland-telegram-notifications-production.up.railway.app/api/test-sunflower" -Method GET
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "API connection successful",
  "data": {
    "status": "ok",
    "timestamp": "2025-09-15T10:30:00Z"
  }
}
```

### 2. Lấy Player ID từ Game

**Cách 1: Sử dụng Developer Tools**
1. **Mở game** trong trình duyệt
2. **Nhấn F12** → Console tab
3. **Gõ lệnh**:
```javascript
// Lấy player ID
const playerId = window.gameState?.playerId || window.playerId;
console.log('Player ID:', playerId);

// Hoặc lấy từ localStorage
const storedPlayerId = localStorage.getItem('playerId');
console.log('Stored Player ID:', storedPlayerId);
```

**Cách 2: Sử dụng Network Tab**
1. **Mở Developer Tools** → Network tab
2. **Refresh game**
3. **Tìm request** có chứa player ID trong URL hoặc response

### 3. Lấy thông tin player

```bash
curl -X GET "https://sunflowerland-telegram-notifications-production.up.railway.app/api/sunflower/player/YOUR_PLAYER_ID/profile"
```

### 4. Lấy danh sách cây trồng

```bash
curl -X GET "https://sunflowerland-telegram-notifications-production.up.railway.app/api/sunflower/player/YOUR_PLAYER_ID/crops"
```

### 5. Sync dữ liệu vào database

```bash
curl -X POST "https://sunflowerland-telegram-notifications-production.up.railway.app/api/sunflower/sync/YOUR_PLAYER_ID"
```

### 6. Liên kết Player ID với tài khoản

```bash
curl -X POST "https://sunflowerland-telegram-notifications-production.up.railway.app/api/sunflower/link-player" \
  -H "Content-Type: application/json" \
  -d '{"playerId": "YOUR_PLAYER_ID"}'
```

## 🔧 API Endpoints có sẵn

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/sunflower/test-connection` | GET | Test kết nối API |
| `/api/sunflower/player/:playerId/farm` | GET | Lấy thông tin farm |
| `/api/sunflower/player/:playerId/crops` | GET | Lấy danh sách cây trồng |
| `/api/sunflower/player/:playerId/inventory` | GET | Lấy inventory |
| `/api/sunflower/player/:playerId/profile` | GET | Lấy profile player |
| `/api/sunflower/crops` | GET | Lấy danh sách cây có sẵn |
| `/api/sunflower/sync/:playerId` | POST | Sync dữ liệu vào database |
| `/api/sunflower/link-player` | POST | Liên kết player ID |
| `/api/sunflower/linked-player` | GET | Lấy player ID đã liên kết |
| `/api/sunflower/webhook` | POST | Nhận webhook từ game |

## 📱 Tích hợp với Frontend

### 1. Thêm form liên kết player ID

```jsx
// Trong Settings page
const [playerId, setPlayerId] = useState('');

const handleLinkPlayer = async () => {
  try {
    const response = await api.post('/api/sunflower/link-player', {
      playerId: playerId
    });
    
    if (response.data.success) {
      toast.success('Liên kết player ID thành công!');
      // Sync dữ liệu
      await api.post(`/api/sunflower/sync/${playerId}`);
    }
  } catch (error) {
    toast.error('Lỗi khi liên kết player ID');
  }
};
```

### 2. Hiển thị dữ liệu thật từ game

```jsx
// Trong Dashboard
const { data: cropsData } = useQuery(
  'sunflowerCrops',
  async () => {
    const response = await api.get(`/api/sunflower/player/${playerId}/crops`);
    return response.data;
  },
  {
    refetchInterval: 30000, // Refresh every 30 seconds
  }
);
```

## 🔒 Bảo mật

1. **Không chia sẻ JWT token** với người khác
2. **Lưu trữ token** trong environment variables
3. **Không commit token** vào git repository
4. **Refresh token** định kỳ nếu cần

## 📞 Hỗ trợ

- **Documentation**: [Sunflower Land Docs](https://docs.sunflower-land.com/)
- **Discord**: [Sunflower Land Discord](https://discord.gg/sunflowerland)
- **GitHub**: [Sunflower Land GitHub](https://github.com/sunflower-land/sunflower-land)

## 🔧 Troubleshooting - Xử lý lỗi thường gặp

### Lỗi 1: "API connection failed"

**Nguyên nhân:** JWT token không hợp lệ hoặc hết hạn

**Giải pháp:**
1. **Kiểm tra JWT token** có đúng format không
2. **Lấy JWT token mới** từ game
3. **Cập nhật** environment variable trên Railway
4. **Redeploy** project

### Lỗi 2: "Player not found"

**Nguyên nhân:** Player ID không tồn tại hoặc không đúng

**Giải pháp:**
1. **Kiểm tra Player ID** có đúng không
2. **Đảm bảo** đã đăng nhập game và có dữ liệu
3. **Thử** lấy Player ID bằng cách khác

### Lỗi 3: "Rate limit exceeded"

**Nguyên nhân:** Gọi API quá nhiều lần

**Giải pháp:**
1. **Chờ** 1-2 phút trước khi gọi lại
2. **Giảm** tần suất gọi API
3. **Sử dụng** cache để giảm số lần gọi API

### Lỗi 4: "CORS error"

**Nguyên nhân:** Browser chặn cross-origin requests

**Giải pháp:**
1. **Sử dụng** server-side API calls
2. **Cấu hình** CORS headers đúng cách
3. **Sử dụng** proxy server

## 📝 Ví dụ thực tế

### Ví dụ 1: Lấy JWT Token từ Console (Desktop)

```javascript
// Mở game trong trình duyệt
// Nhấn F12 → Console tab
// Gõ lệnh sau:

// Lấy JWT token
const jwt = localStorage.getItem('jwt') || sessionStorage.getItem('jwt');
console.log('JWT Token:', jwt);

// Lấy Player ID
const playerId = window.gameState?.playerId || localStorage.getItem('playerId');
console.log('Player ID:', playerId);

// Copy kết quả và sử dụng
```

### Ví dụ 1b: Lấy JWT Token từ Chrome Android (Mobile)

**Cách 1: Sử dụng JavaScript URL**
```
javascript:console.log('JWT:', localStorage.getItem('jwt'));
```

**Cách 2: Sử dụng Bookmark**
```javascript
javascript:(function(){
  const jwt = localStorage.getItem('jwt');
  const playerId = window.gameState?.playerId || localStorage.getItem('playerId');
  
  if (jwt) {
    prompt('JWT Token:', jwt);
  } else {
    alert('JWT token not found');
  }
  
  if (playerId) {
    prompt('Player ID:', playerId);
  } else {
    alert('Player ID not found');
  }
})();
```

**Cách 3: Sử dụng Chrome Remote Debugging**
1. **Kết nối** điện thoại với máy tính qua USB
2. **Mở** `chrome://inspect/#devices` trên máy tính
3. **Chọn** tab của Sunflower Land
4. **Mở Console** và gõ lệnh như desktop

### Ví dụ 2: Test API với PowerShell

```powershell
# Test API connection
$response = Invoke-WebRequest -Uri "https://sunflowerland-telegram-notifications-production.up.railway.app/api/test-sunflower" -Method GET
$response.Content

# Lấy thông tin player (thay YOUR_PLAYER_ID bằng ID thật)
$playerResponse = Invoke-WebRequest -Uri "https://sunflowerland-telegram-notifications-production.up.railway.app/api/sunflower/player/YOUR_PLAYER_ID/profile" -Method GET
$playerResponse.Content
```

### Ví dụ 3: Liên kết Player ID

```powershell
# Liên kết Player ID với tài khoản
$body = @{
    playerId = "YOUR_PLAYER_ID"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://sunflowerland-telegram-notifications-production.up.railway.app/api/sunflower/link-player" -Method POST -Body $body -ContentType "application/json"
$response.Content
```

## 🎯 Checklist hoàn thành

- [ ] **Truy cập** Sunflower Land game và đăng nhập
- [ ] **Lấy JWT token** từ Developer Tools
- [ ] **Lấy Player ID** từ game
- [ ] **Cấu hình** environment variables trên Railway
- [ ] **Test API connection** với `/api/test-sunflower`
- [ ] **Liên kết Player ID** với tài khoản
- [ ] **Sync dữ liệu** cây trồng vào database
- [ ] **Test** các API endpoints khác
- [ ] **Cấu hình** Telegram bot để nhận thông báo

## ⚠️ Lưu ý quan trọng

- **JWT token có thể có thời hạn sử dụng** - cần refresh định kỳ
- **Cần refresh token** khi hết hạn
- **API có thể thay đổi** - cần cập nhật theo documentation chính thức
- **Rate limiting: 1 request/second** để tránh spam API
- **Không chia sẻ JWT token** với người khác
- **Lưu trữ token** trong environment variables an toàn
- **Backup token** để tránh mất dữ liệu
