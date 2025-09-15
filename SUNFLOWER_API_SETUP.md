# 🌻 Hướng dẫn lấy JWT Token từ Sunflower Land

## 📋 Tổng quan

Sunflower Land sử dụng **JWT Token** thay vì API key truyền thống để xác thực. JWT token này được cung cấp thông qua URL parameter khi người chơi truy cập portal.

## 🔑 Cách lấy JWT Token

### Bước 1: Tạo Portal trên Sunflower Land

1. **Truy cập**: [Sunflower Land Developer Portal](https://docs.sunflower-land.com/contributing/portals/portal-apis)
2. **Đăng ký** tài khoản developer nếu chưa có
3. **Tạo portal mới** với thông tin:
   - Portal Name: `Sunflower Land Telegram Bot`
   - Description: `Telegram notification system for harvest reminders`
   - Redirect URL: `https://your-domain.com/auth/sunflower/callback`

### Bước 2: Lấy JWT Token

JWT token sẽ được cung cấp qua URL parameter khi người chơi truy cập portal:

```
https://your-portal.sunflower-land.com/?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Bước 3: Cấu hình Environment Variables

Thêm vào file `.env` hoặc `env.production`:

```env
# Sunflower Land API Configuration
SUNFLOWER_API_URL=https://api.sunflowerland.io
SUNFLOWER_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # JWT token từ portal
```

## 🚀 Cách sử dụng

### 1. Test API Connection

```bash
GET /api/test-sunflower
```

### 2. Lấy thông tin player

```bash
GET /api/sunflower/player/{playerId}/profile
```

### 3. Lấy danh sách cây trồng

```bash
GET /api/sunflower/player/{playerId}/crops
```

### 4. Sync dữ liệu vào database

```bash
POST /api/sunflower/sync/{playerId}
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

## ⚠️ Lưu ý

- JWT token có thể có thời hạn sử dụng
- Cần refresh token định kỳ
- API có thể thay đổi, cần cập nhật theo documentation chính thức
- Rate limiting: 1 request/second để tránh spam API
