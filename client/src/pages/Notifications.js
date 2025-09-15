import React from 'react';
import { useQuery } from 'react-query';
import { api } from '../services/api';
import { Bell, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Notifications = () => {
  const { data: notificationsData, isLoading, refetch } = useQuery(
    'notifications',
    async () => {
      const response = await api.get('/notifications');
      return response.data;
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Bell className="w-8 h-8 animate-pulse text-sunflower-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  const notifications = notificationsData?.notifications || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
        <p className="text-gray-600 mt-2">
          Quản lý và theo dõi tất cả thông báo của bạn
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có thông báo nào
          </h3>
          <p className="text-gray-600">
            Bạn sẽ nhận được thông báo khi cây trồng sẵn sàng thu hoạch
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="notification-card">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {notification.type === 'harvest_ready' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : notification.type === 'daily_summary' ? (
                    <Clock className="w-6 h-6 text-blue-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      notification.sent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {notification.sent ? 'Đã gửi' : 'Chờ gửi'}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Tạo lúc: {new Date(notification.created_at).toLocaleString('vi-VN')}</span>
                    {notification.sent_at && (
                      <span>Gửi lúc: {new Date(notification.sent_at).toLocaleString('vi-VN')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
