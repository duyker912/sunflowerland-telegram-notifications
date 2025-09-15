import React, { useState, useEffect } from "react";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";

interface TelegramSettingsProps {
  gameState: any;
  apiUrl: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  telegram_linked: boolean;
  notifications_enabled: boolean;
  telegram_username?: string;
}

export const TelegramSettings: React.FC<TelegramSettingsProps> = ({ gameState, apiUrl }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUserData(result.user);
        setTelegramUsername(result.user.telegram_username || '');
        setNotificationsEnabled(result.user.notifications_enabled || false);
      } else {
        throw new Error('Không thể tải dữ liệu user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkTelegram = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${apiUrl}/auth/telegram`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telegram_username: telegramUsername
        })
      });

      if (response.ok) {
        setSuccess('Đã liên kết tài khoản Telegram thành công!');
        await fetchUserData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Liên kết thất bại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkTelegram = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${apiUrl}/auth/telegram`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Đã hủy liên kết tài khoản Telegram!');
        await fetchUserData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Hủy liên kết thất bại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${apiUrl}/auth/notifications`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notifications_enabled: notificationsEnabled
        })
      });

      if (response.ok) {
        setSuccess('Đã cập nhật cài đặt thông báo!');
        await fetchUserData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Cập nhật thất bại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <Panel>
        <div className="p-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Panel>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Thông tin tài khoản</h3>
          {userData && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Username:</span>
                <span>{userData.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{userData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Telegram Linked:</span>
                <span className={userData.telegram_linked ? 'text-green-600' : 'text-red-600'}>
                  {userData.telegram_linked ? '✅ Có' : '❌ Không'}
                </span>
              </div>
              {userData.telegram_username && (
                <div className="flex justify-between">
                  <span className="font-medium">Telegram Username:</span>
                  <span>@{userData.telegram_username}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Panel>

      {/* Telegram Settings */}
      <Panel>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Cài đặt Telegram</h3>
          
          {error && (
            <div className="mb-4">
              <Label type="danger">{error}</Label>
            </div>
          )}

          {success && (
            <div className="mb-4">
              <Label type="success">{success}</Label>
            </div>
          )}

          {!userData?.telegram_linked ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram Username
                </label>
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  placeholder="Nhập username Telegram (không có @)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <Button 
                onClick={handleLinkTelegram} 
                disabled={loading || !telegramUsername}
                className="w-full"
              >
                {loading ? 'Đang liên kết...' : 'Liên kết Telegram'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-green-800">
                  ✅ Tài khoản Telegram đã được liên kết với @{userData.telegram_username}
                </p>
              </div>
              <Button 
                onClick={handleUnlinkTelegram} 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Đang hủy liên kết...' : 'Hủy liên kết Telegram'}
              </Button>
            </div>
          )}
        </div>
      </Panel>

      {/* Notification Settings */}
      <Panel>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Cài đặt thông báo</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Bật thông báo thu hoạch
                </label>
                <p className="text-xs text-gray-500">
                  Nhận thông báo khi cây trồng sẵn sàng thu hoạch
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
            </div>
            
            <Button 
              onClick={handleUpdateNotifications} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật cài đặt'}
            </Button>
          </div>
        </div>
      </Panel>

      {/* Instructions */}
      <Panel>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Hướng dẫn sử dụng</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="font-bold text-green-600">1.</span>
              <span>Liên kết tài khoản Telegram bằng cách nhập username của bạn</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-green-600">2.</span>
              <span>Bật thông báo để nhận tin nhắn khi cây sẵn sàng thu hoạch</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-green-600">3.</span>
              <span>Trồng cây trong game Sunflower Land để bắt đầu nhận thông báo</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-green-600">4.</span>
              <span>Sử dụng bot Telegram để quản lý cây trồng từ xa</span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
};