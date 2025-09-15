-- Setup Database cho Supabase
-- Chạy script này trong SQL Editor của Supabase

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

-- Tạo indexes để tối ưu performance
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

-- Thêm dữ liệu mẫu cho crops
INSERT INTO crops (name, type, grow_time, harvest_time, sell_price, description) VALUES
('Sunflower', 'crop', 60, 60, 0.02, 'Cây hướng dương cơ bản, dễ trồng và thu hoạch nhanh'),
('Potato', 'crop', 300, 300, 0.14, 'Khoai tây, thời gian phát triển trung bình'),
('Pumpkin', 'crop', 1800, 1800, 0.8, 'Bí ngô, cần thời gian phát triển lâu nhưng giá trị cao'),
('Carrot', 'crop', 60, 60, 0.02, 'Cà rốt, cây trồng cơ bản'),
('Cabbage', 'crop', 900, 900, 0.4, 'Bắp cải, thời gian phát triển dài'),
('Beetroot', 'crop', 300, 300, 0.14, 'Củ cải đỏ, cây trồng trung bình'),
('Cauliflower', 'crop', 1800, 1800, 0.8, 'Súp lơ, cần thời gian phát triển lâu'),
('Parsnip', 'crop', 900, 900, 0.4, 'Củ cải vàng, thời gian phát triển dài'),
('Eggplant', 'crop', 1800, 1800, 0.8, 'Cà tím, cần thời gian phát triển lâu'),
('Corn', 'crop', 900, 900, 0.4, 'Ngô, thời gian phát triển dài'),
('Radish', 'crop', 60, 60, 0.02, 'Củ cải, cây trồng cơ bản'),
('Wheat', 'crop', 300, 300, 0.14, 'Lúa mì, cây trồng trung bình'),
('Kale', 'crop', 1800, 1800, 0.8, 'Cải xoăn, cần thời gian phát triển lâu'),
('Apple Tree', 'tree', 3600, 3600, 1.5, 'Cây táo, cần thời gian phát triển rất lâu nhưng giá trị cao'),
('Orange Tree', 'tree', 3600, 3600, 1.5, 'Cây cam, cần thời gian phát triển rất lâu'),
('Blueberry Bush', 'bush', 1800, 1800, 0.8, 'Bụi việt quất, thời gian phát triển dài'),
('Banana Plant', 'tree', 3600, 3600, 1.5, 'Cây chuối, cần thời gian phát triển rất lâu');

-- Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo triggers cho updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_crops_updated_at BEFORE UPDATE ON user_crops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
