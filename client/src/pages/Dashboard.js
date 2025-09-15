import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  Sunflower, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Bell,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user crops
  const { data: cropsData, isLoading, refetch } = useQuery(
    'userCrops',
    async () => {
      const response = await api.get('/crops/user-crops');
      return response.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Fetch notifications
  const { data: notificationsData } = useQuery(
    'notifications',
    async () => {
      const response = await api.get('/notifications');
      return response.data;
    }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success('Đã cập nhật dữ liệu');
    } catch (error) {
      toast.error('Lỗi khi cập nhật dữ liệu');
    } finally {
      setRefreshing(false);
    }
  };

  const getCropStatus = (crop) => {
    const now = new Date();
    const harvestTime = new Date(crop.harvest_ready_at);
    
    if (crop.is_harvested) {
      return { status: 'harvested', text: 'Đã thu hoạch', color: 'text-gray-500' };
    } else if (harvestTime <= now) {
      return { status: 'ready', text: 'Sẵn sàng thu hoạch', color: 'text-green-600' };
    } else {
      return { status: 'growing', text: 'Đang phát triển', color: 'text-yellow-600' };
    }
  };

  const getTimeRemaining = (harvestTime) => {
    const now = new Date();
    const harvest = new Date(harvestTime);
    const diff = harvest - now;
    
    if (diff <= 0) return 'Sẵn sàng';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const readyToHarvest = cropsData?.crops?.filter(crop => {
    const now = new Date();
    const harvestTime = new Date(crop.harvest_ready_at);
    return !crop.is_harvested && harvestTime <= now;
  }) || [];

  const totalCrops = cropsData?.crops?.length || 0;
  const harvestedCrops = cropsData?.crops?.filter(crop => crop.is_harvested).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-sunflower-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng, {user?.username}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Theo dõi tiến độ cây trồng và thông báo thu hoạch
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-outline flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng cây trồng</p>
              <p className="text-2xl font-bold text-gray-900">{totalCrops}</p>
            </div>
            <Sunflower className="w-8 h-8 text-sunflower-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sẵn sàng thu hoạch</p>
              <p className="text-2xl font-bold text-green-600">{readyToHarvest.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã thu hoạch</p>
              <p className="text-2xl font-bold text-gray-900">{harvestedCrops}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Thông báo</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.telegram_linked ? '✅' : '❌'}
              </p>
            </div>
            <Bell className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Ready to Harvest Alert */}
      {readyToHarvest.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">
              Cây sẵn sàng thu hoạch!
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyToHarvest.map((crop) => (
              <div key={crop.id} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{crop.name}</h4>
                    <p className="text-sm text-gray-600">Số lượng: {crop.quantity}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crops List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Cây trồng của bạn</h2>
          <span className="text-sm text-gray-500">
            Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}
          </span>
        </div>

        {totalCrops === 0 ? (
          <div className="text-center py-12">
            <Sunflower className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có cây trồng nào
            </h3>
            <p className="text-gray-600">
              Hãy trồng cây trong game để bắt đầu nhận thông báo!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cropsData?.crops?.map((crop) => {
              const status = getCropStatus(crop);
              return (
                <div key={crop.id} className="crop-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-sunflower-400 rounded-lg flex items-center justify-center">
                        <Sunflower className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{crop.name}</h3>
                        <p className="text-sm text-gray-600">
                          Số lượng: {crop.quantity} • Trồng lúc: {new Date(crop.planted_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-medium ${status.color}`}>
                        {status.text}
                      </div>
                      {status.status === 'growing' && (
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{getTimeRemaining(crop.harvest_ready_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      {notificationsData?.notifications?.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông báo gần đây</h2>
          <div className="space-y-4">
            {notificationsData.notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="notification-card">
                <div className="flex items-start space-x-3">
                  <Bell className="w-5 h-5 text-sunflower-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    notification.sent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {notification.sent ? 'Đã gửi' : 'Chờ gửi'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
