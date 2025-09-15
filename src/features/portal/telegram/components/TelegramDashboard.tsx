import React, { useState, useEffect } from "react";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";

interface TelegramDashboardProps {
  gameState: any;
  apiUrl: string;
}

interface CropData {
  id: string;
  crop_name: string;
  planted_at: string;
  harvest_time: string;
  status: string;
  progress: number;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  telegram_linked: boolean;
  notifications_enabled: boolean;
}

export const TelegramDashboard: React.FC<TelegramDashboardProps> = ({ gameState, apiUrl }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cropsData, setCropsData] = useState<CropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy thông tin user từ game state
      const farmId = gameState?.farm?.id;
      if (!farmId) {
        throw new Error('Không tìm thấy Farm ID');
      }

      // Gọi API để lấy dữ liệu user và crops
      const [userResponse, cropsResponse] = await Promise.all([
        fetch(`${apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${apiUrl}/crops/user-crops`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (userResponse.ok) {
        const userResult = await userResponse.json();
        setUserData(userResult.user);
      }

      if (cropsResponse.ok) {
        const cropsResult = await cropsResponse.json();
        setCropsData(cropsResult.userCrops || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCrops = async () => {
    try {
      setLoading(true);
      const farmId = gameState?.farm?.id;
      
      if (!farmId) {
        throw new Error('Không tìm thấy Farm ID');
      }

      const response = await fetch(`${apiUrl}/sunflower/sync/${farmId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchDashboardData();
        alert('Đã đồng bộ dữ liệu cây trồng thành công!');
      } else {
        throw new Error('Đồng bộ thất bại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const getCropStatus = (crop: CropData) => {
    const now = new Date();
    const harvestTime = new Date(crop.harvest_time);
    
    if (crop.status === 'harvested') {
      return { status: 'harvested', text: 'Đã thu hoạch', color: 'text-gray-500' };
    } else if (crop.status === 'ready' || harvestTime <= now) {
      return { status: 'ready', text: 'Sẵn sàng thu hoạch', color: 'text-green-600' };
    } else {
      return { status: 'growing', text: 'Đang phát triển', color: 'text-yellow-600' };
    }
  };

  const getTimeRemaining = (harvestTime: string) => {
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

  const readyToHarvest = cropsData.filter(crop => {
    const now = new Date();
    const harvestTime = new Date(crop.harvest_time);
    return crop.status === 'ready' && harvestTime <= now;
  });

  if (loading) {
    return (
      <Panel>
        <div className="p-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel>
        <div className="p-4">
          <Label type="danger">Lỗi: {error}</Label>
          <Button onClick={fetchDashboardData} className="mt-2">
            Thử lại
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Panel>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900">Tổng cây trồng</h3>
            <p className="text-3xl font-bold text-green-600">{cropsData.length}</p>
          </div>
        </Panel>

        <Panel>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900">Sẵn sàng thu hoạch</h3>
            <p className="text-3xl font-bold text-yellow-600">{readyToHarvest.length}</p>
          </div>
        </Panel>

        <Panel>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900">Telegram</h3>
            <p className="text-3xl font-bold text-blue-600">
              {userData?.telegram_linked ? '✅' : '❌'}
            </p>
          </div>
        </Panel>
      </div>

      {/* Actions */}
      <Panel>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Hành động</h3>
          <div className="flex space-x-4">
            <Button onClick={handleSyncCrops} disabled={loading}>
              {loading ? 'Đang đồng bộ...' : 'Đồng bộ cây trồng'}
            </Button>
            <Button onClick={fetchDashboardData} disabled={loading}>
              Làm mới dữ liệu
            </Button>
          </div>
        </div>
      </Panel>

      {/* Ready to Harvest Alert */}
      {readyToHarvest.length > 0 && (
        <Panel>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              ⚠️ Cây sẵn sàng thu hoạch!
            </h3>
            <div className="space-y-2">
              {readyToHarvest.map((crop) => (
                <div key={crop.id} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{crop.crop_name}</span>
                    <span className="text-green-600 font-semibold">Sẵn sàng!</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {/* Crops List */}
      <Panel>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Danh sách cây trồng</h3>
          {cropsData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có cây trồng nào</p>
              <p className="text-sm">Hãy trồng cây trong game để bắt đầu!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cropsData.map((crop) => {
                const status = getCropStatus(crop);
                return (
                  <div key={crop.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{crop.crop_name}</h4>
                        <p className="text-sm text-gray-600">
                          Trồng: {new Date(crop.planted_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${status.color}`}>
                          {status.text}
                        </div>
                        {status.status === 'growing' && (
                          <div className="text-sm text-gray-500">
                            {getTimeRemaining(crop.harvest_time)}
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
      </Panel>
    </div>
  );
};