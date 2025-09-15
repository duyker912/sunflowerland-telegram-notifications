import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Smartphone, Unlink, Link, Save } from 'lucide-react';

const Settings = () => {
  const { user, linkTelegram, unlinkTelegram, updateNotificationSettings } = useAuth();
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLinkTelegram = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await linkTelegram(telegramChatId, telegramUsername);
    
    if (result.success) {
      setTelegramChatId('');
      setTelegramUsername('');
    }
    
    setLoading(false);
  };

  const handleUnlinkTelegram = async () => {
    setLoading(true);
    await unlinkTelegram();
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600 mt-2">
          Quản lý cài đặt tài khoản và thông báo
        </p>
      </div>

      {/* Telegram Settings */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Smartphone className="w-6 h-6 text-sunflower-500" />
          <h2 className="text-xl font-semibold text-gray-900">Cài đặt Telegram</h2>
        </div>

        {user?.telegram_linked ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Telegram đã được liên kết</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Bạn sẽ nhận được thông báo thu hoạch qua Telegram
              </p>
            </div>
            
            <button
              onClick={handleUnlinkTelegram}
              disabled={loading}
              className="btn-outline flex items-center space-x-2"
            >
              <Unlink className="w-4 h-4" />
              <span>Hủy liên kết Telegram</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">Telegram chưa được liên kết</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Liên kết Telegram để nhận thông báo thu hoạch tự động
              </p>
            </div>

            <form onSubmit={handleLinkTelegram} className="space-y-4">
              <div>
                <label htmlFor="telegramChatId" className="label">
                  Telegram Chat ID
                </label>
                <input
                  id="telegramChatId"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Nhập Chat ID từ bot @Sun_notiLico_Bot"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Gửi /start cho bot để lấy Chat ID
                </p>
              </div>

              <div>
                <label htmlFor="telegramUsername" className="label">
                  Telegram Username (tùy chọn)
                </label>
                <input
                  id="telegramUsername"
                  type="text"
                  className="input-field"
                  placeholder="@username"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                <Link className="w-4 h-4" />
                <span>{loading ? 'Đang liên kết...' : 'Liên kết Telegram'}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-sunflower-500" />
          <h2 className="text-xl font-semibold text-gray-900">Cài đặt thông báo</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Thông báo thu hoạch</h3>
              <p className="text-sm text-gray-600">Nhận thông báo khi cây sẵn sàng thu hoạch</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={user?.notifications_enabled}
                onChange={(e) => updateNotificationSettings({ notifications_enabled: e.target.checked })}
                className="h-4 w-4 text-sunflower-600 focus:ring-sunflower-500 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Báo cáo hàng ngày</h3>
              <p className="text-sm text-gray-600">Nhận báo cáo tổng kết hàng ngày lúc 8:00</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={user?.notification_settings?.daily_summary !== false}
                onChange={(e) => updateNotificationSettings({ 
                  notification_settings: { 
                    ...user?.notification_settings, 
                    daily_summary: e.target.checked 
                  } 
                })}
                className="h-4 w-4 text-sunflower-600 focus:ring-sunflower-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin tài khoản</h2>
        
        <div className="space-y-4">
          <div>
            <label className="label">Tên người dùng</label>
            <p className="text-gray-900 font-medium">{user?.username}</p>
          </div>
          
          <div>
            <label className="label">Email</label>
            <p className="text-gray-900 font-medium">{user?.email}</p>
          </div>
          
          <div>
            <label className="label">Trạng thái Telegram</label>
            <p className={`font-medium ${user?.telegram_linked ? 'text-green-600' : 'text-red-600'}`}>
              {user?.telegram_linked ? 'Đã liên kết' : 'Chưa liên kết'}
            </p>
          </div>
          
          <div>
            <label className="label">Đăng nhập lần cuối</label>
            <p className="text-gray-900 font-medium">
              {user?.last_login ? new Date(user.last_login).toLocaleString('vi-VN') : 'Chưa có'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
