import React, { useState, useEffect } from "react";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";

interface TelegramNotificationsProps {
  gameState: any;
  apiUrl: string;
}

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  sent: boolean;
  created_at: string;
  user_id: number;
}

export const TelegramNotifications: React.FC<TelegramNotificationsProps> = ({ gameState, apiUrl }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setNotifications(result.notifications || []);
      } else {
        throw new Error('Không thể tải danh sách thông báo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setTestLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/test-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Đã gửi thông báo test thành công!');
          await fetchNotifications();
        } else {
          throw new Error(result.error || 'Gửi thông báo test thất bại');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gửi thông báo test thất bại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestHarvestNotification = async () => {
    try {
      setTestLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/test-harvest-notification/1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Đã gửi thông báo thu hoạch test thành công!');
          await fetchNotifications();
        } else {
          throw new Error(result.error || 'Gửi thông báo thu hoạch test thất bại');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gửi thông báo thu hoạch test thất bại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setTestLoading(false);
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'harvest':
        return 'bg-green-100 text-green-800';
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'test':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'harvest':
        return 'Thu hoạch';
      case 'daily':
        return 'Hàng ngày';
      case 'test':
        return 'Test';
      default:
        return 'Khác';
    }
  };

  if (loading) {
    return (
      <Panel>
        <div className="p-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Đang tải danh sách thông báo...</p>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Actions */}
      <Panel>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Test thông báo</h3>
          
          {error && (
            <div className="mb-4">
              <Label type="danger">{error}</Label>
            </div>
          )}

          <div className="flex space-x-4">
            <Button 
              onClick={handleTestNotification} 
              disabled={testLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {testLoading ? 'Đang gửi...' : 'Test thông báo chung'}
            </Button>
            <Button 
              onClick={handleTestHarvestNotification} 
              disabled={testLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {testLoading ? 'Đang gửi...' : 'Test thông báo thu hoạch'}
            </Button>
            <Button 
              onClick={fetchNotifications} 
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Làm mới
            </Button>
          </div>
        </div>
      </Panel>

      {/* Notifications List */}
      <Panel>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            Lịch sử thông báo ({notifications.length})
          </h3>
          
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có thông báo nào</p>
              <p className="text-sm">Thông báo sẽ xuất hiện ở đây khi có cây sẵn sàng thu hoạch</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}>
                        {getNotificationTypeText(notification.type)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.sent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {notification.sent ? 'Đã gửi' : 'Chờ gửi'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Notification Stats */}
      <Panel>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Thống kê thông báo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {notifications.filter(n => n.type === 'harvest').length}
              </div>
              <div className="text-sm text-gray-600">Thông báo thu hoạch</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.sent).length}
              </div>
              <div className="text-sm text-gray-600">Đã gửi</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {notifications.filter(n => !n.sent).length}
              </div>
              <div className="text-sm text-gray-600">Chờ gửi</div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Bot Commands */}
      <Panel>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Lệnh Telegram Bot</h3>
          
          <div className="space-y-3 text-sm">
            <div className="bg-gray-50 p-3 rounded border">
              <div className="font-medium text-gray-900">Các lệnh có sẵn:</div>
              <div className="mt-2 space-y-1 text-gray-600">
                <div><code>/start</code> - Bắt đầu sử dụng bot</div>
                <div><code>/help</code> - Xem danh sách lệnh</div>
                <div><code>/link &lt;email&gt; &lt;password&gt;</code> - Liên kết tài khoản</div>
                <div><code>/unlink</code> - Hủy liên kết tài khoản</div>
                <div><code>/status</code> - Kiểm tra trạng thái</div>
                <div><code>/crops</code> - Xem danh sách cây trồng</div>
                <div><code>/harvest</code> - Thu hoạch cây trồng</div>
                <div><code>/settings</code> - Cài đặt thông báo</div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <div className="font-medium text-blue-900">Lưu ý:</div>
              <div className="mt-1 text-blue-800">
                Để sử dụng bot, bạn cần liên kết tài khoản Telegram trước trong phần Cài đặt.
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
};