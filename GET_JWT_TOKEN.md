# 🔑 Cách lấy JWT Token từ Sunflower Land

## ⚠️ **JWT Token là BẮT BUỘC**

Theo documentation chính thức của Sunflower Land, **JWT token là bắt buộc** để:
- ✅ Xác thực người chơi
- ✅ Truy cập dữ liệu cá nhân
- ✅ Bảo mật thông tin
- ✅ Tuân thủ chính sách API

**Không có cách nào khác** để bỏ qua JWT authentication.

## 📱 **Cách lấy JWT Token trên Chrome Android**

### **Cách 1: Sử dụng JavaScript URL (Đơn giản nhất)**

1. **Mở game** trong Chrome Android: [https://sunflowerland.io](https://sunflowerland.io)
2. **Đăng nhập** và chơi một chút
3. **Nhấn** vào thanh địa chỉ
4. **Gõ** (copy paste):
   ```
   javascript:alert('JWT: ' + localStorage.getItem('jwt'));
   ```
5. **Nhấn Enter**
6. **Copy JWT token** từ popup alert

### **Cách 2: Sử dụng Console (Nếu có thể mở)**

1. **Mở game** trong Chrome Android
2. **Nhấn** vào thanh địa chỉ
3. **Gõ**: `chrome://inspect`
4. **Nhấn Enter**
5. **Chọn** "Inspect" cho tab Sunflower Land
6. **Mở Console** và gõ:
   ```javascript
   localStorage.getItem('jwt')
   ```

### **Cách 3: Sử dụng Chrome Remote Debugging**

1. **Kết nối** điện thoại với máy tính qua USB
2. **Bật USB Debugging** trên điện thoại:
   - Vào **Settings** → **About Phone**
   - **Nhấn 7 lần** vào "Build Number"
   - Vào **Settings** → **Developer Options**
   - **Bật** "USB Debugging"
3. **Trên máy tính**, mở Chrome
4. **Gõ**: `chrome://inspect/#devices`
5. **Chọn** tab của Sunflower Land
6. **Mở Console** và gõ lệnh

## 🖥️ **Cách lấy JWT Token trên Desktop**

### **Chrome/Edge/Firefox:**

1. **Mở game**: [https://sunflowerland.io](https://sunflowerland.io)
2. **Đăng nhập** và chơi một chút
3. **Nhấn F12** → Console tab
4. **Gõ lệnh**:
   ```javascript
   localStorage.getItem('jwt')
   ```
5. **Copy JWT token** từ console

## 🔧 **Cấu hình JWT Token**

### **Trên Railway:**

1. **Truy cập**: [Railway Dashboard](https://railway.app)
2. **Chọn project** → Variables tab
3. **Thêm**:
   - `SUNFLOWER_JWT_TOKEN` = `your_jwt_token_here` (thay bằng JWT token thật)
4. **Save** và **Redeploy**

### **Test API:**

```bash
# Test connection
curl "https://sunflowerland-telegram-notifications-production.up.railway.app/api/test-sunflower"
```

## ❓ **Nếu không thể lấy JWT Token**

### **Kiểm tra:**

1. **Đã đăng nhập** game chưa?
2. **Đã chơi** một chút để có dữ liệu chưa?
3. **JWT token** có tồn tại trong localStorage không?

### **Thử các cách khác:**

1. **Refresh** trang game
2. **Đăng nhập lại** game
3. **Thử** trên desktop trước
4. **Liên hệ** Sunflower Land support

## 🎯 **Mục tiêu**

- ✅ **Lấy JWT token** từ game
- ✅ **Cấu hình** trên Railway
- ✅ **Test API** connection
- ✅ **Liên kết** Player ID
- ✅ **Sync dữ liệu** cây trồng
- ✅ **Nhận thông báo** thật

## 📞 **Cần hỗ trợ?**

- **Discord**: [Sunflower Land Discord](https://discord.gg/sunflowerland)
- **Documentation**: [Sunflower Land Docs](https://docs.sunflower-land.com/)
- **GitHub**: [Sunflower Land GitHub](https://github.com/sunflower-land/sunflower-land)

## ⚠️ **Lưu ý quan trọng**

- **JWT token là bắt buộc** - không có cách nào khác
- **Cần JWT token thật** - không thể dùng mock data
- **Token có thể hết hạn** - cần refresh định kỳ
- **Không chia sẻ token** với người khác
