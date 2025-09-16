import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Package, 
  MapPin, 
  User, 
  RefreshCw,
  DollarSign,
  BarChart3,
  Info
} from 'lucide-react';
import { api } from '../services/api';

const SunflowerLandData = () => {
  const [data, setData] = useState({
    prices: null,
    exchange: null,
    nfts: null,
    landInfo: null,
    landBoosts: null,
    landSummary: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFarmId, setSelectedFarmId] = useState('2749154680612546');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel using api instance
      const [pricesRes, exchangeRes, nftsRes, landInfoRes, landBoostsRes, landSummaryRes] = await Promise.allSettled([
        api.get('/sunflower/prices'),
        api.get('/sunflower/exchange'),
        api.get('/sunflower/nfts'),
        api.get(`/sunflower/land/info/farm_id/${selectedFarmId}`),
        api.get(`/sunflower/land/${data.landInfo?.data?.nft_id || '114779'}/boosts`),
        api.get(`/sunflower/land/${data.landInfo?.data?.nft_id || '114779'}/summary`)
      ]);

      const newData = {};

      if (pricesRes.status === 'fulfilled') {
        newData.prices = pricesRes.value.data;
      }

      if (exchangeRes.status === 'fulfilled') {
        newData.exchange = exchangeRes.value.data;
      }

      if (nftsRes.status === 'fulfilled') {
        newData.nfts = nftsRes.value.data;
      }

      if (landInfoRes.status === 'fulfilled') {
        newData.landInfo = landInfoRes.value.data;
      }

      if (landBoostsRes.status === 'fulfilled') {
        newData.landBoosts = landBoostsRes.value.data;
      }

      if (landSummaryRes.status === 'fulfilled') {
        newData.landSummary = landSummaryRes.value.data;
      }

      setData(newData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedFarmId]);

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return typeof price === 'object' ? JSON.stringify(price) : price.toString();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-sunflower-500" />
        <span className="ml-2">Đang tải dữ liệu Sunflower Land...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <Info className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">Lỗi: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <MapPin className="w-6 h-6 mr-2 text-sunflower-500" />
          Sunflower Land Data
        </h2>
        <button
          onClick={fetchData}
          className="flex items-center px-4 py-2 bg-sunflower-500 text-white rounded-lg hover:bg-sunflower-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Farm ID Input */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Farm ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={selectedFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sunflower-500"
            placeholder="Nhập Farm ID..."
          />
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-sunflower-500 text-white rounded-md hover:bg-sunflower-600"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Land Info */}
      {data.landInfo?.success && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-sunflower-500" />
            Thông tin Farm
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Username</div>
              <div className="text-lg font-semibold">{data.landInfo.data.username || 'N/A'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Farm ID</div>
              <div className="text-lg font-semibold">{data.landInfo.data.farm_id || 'N/A'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">NFT ID</div>
              <div className="text-lg font-semibold">{data.landInfo.data.nft_id || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Exchange Data */}
      {data.exchange?.success && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-sunflower-500" />
            Tỷ giá Exchange
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.exchange.data.sfl && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">SFL Price</div>
                <div className="text-lg font-semibold">
                  {formatPrice(data.exchange.data.sfl.usd)} USD
                </div>
              </div>
            )}
            {data.exchange.data.matic && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">MATIC Price</div>
                <div className="text-lg font-semibold">
                  {formatPrice(data.exchange.data.matic.usd)} USD
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prices Data */}
      {data.prices?.success && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-sunflower-500" />
            Giá cả Market
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Cập nhật lần cuối</div>
              <div className="text-lg font-semibold">
                {formatDate(data.prices.data.updatedAt)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Trạng thái</div>
              <div className="text-lg font-semibold text-green-600">
                {data.prices.data.updated_text || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NFTs Data */}
      {data.nfts?.success && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-sunflower-500" />
            NFTs Market
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Collectibles</div>
              <div className="text-lg font-semibold">
                {data.nfts.data.collectibles?.length || 0} items
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Wearables</div>
              <div className="text-lg font-semibold">
                {data.nfts.data.wearables?.length || 0} items
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">Cập nhật lần cuối</div>
            <div className="text-lg font-semibold">
              {formatDate(data.nfts.data.updatedAt)}
            </div>
          </div>
        </div>
      )}

      {/* Land Boosts */}
      {data.landBoosts?.success && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-sunflower-500" />
            Land Boosts
          </h3>
          <div className="space-y-4">
            {/* Resources */}
            {data.landBoosts.data.resources && Object.keys(data.landBoosts.data.resources).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Resources ({Object.keys(data.landBoosts.data.resources).length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(data.landBoosts.data.resources).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium capitalize">{key}:</span>
                      <span className="ml-1 text-gray-600">{value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Crops */}
            {data.landBoosts.data.crops && Object.keys(data.landBoosts.data.crops).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Crops ({Object.keys(data.landBoosts.data.crops).length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(data.landBoosts.data.crops).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium capitalize">{key}:</span>
                      <span className="ml-1 text-gray-600">{value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fruits */}
            {data.landBoosts.data.fruits && Object.keys(data.landBoosts.data.fruits).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Fruits ({Object.keys(data.landBoosts.data.fruits).length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(data.landBoosts.data.fruits).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium capitalize">{key}:</span>
                      <span className="ml-1 text-gray-600">{value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Animals */}
            {data.landBoosts.data.animals && Object.keys(data.landBoosts.data.animals).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Animals ({Object.keys(data.landBoosts.data.animals).length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(data.landBoosts.data.animals).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium capitalize">{key}:</span>
                      <span className="ml-1 text-gray-600">{value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Greenhouse */}
            {data.landBoosts.data.greenhouse && Object.keys(data.landBoosts.data.greenhouse).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Greenhouse ({Object.keys(data.landBoosts.data.greenhouse).length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(data.landBoosts.data.greenhouse).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium capitalize">{key}:</span>
                      <span className="ml-1 text-gray-600">{value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Land Summary */}
      {data.landSummary?.success && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-sunflower-500" />
            Land Summary
          </h3>
          <div className="text-gray-600">
            <p>Thông tin chi tiết về farm sẽ được hiển thị ở đây khi có dữ liệu.</p>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!data.prices?.success && !data.exchange?.success && !data.nfts?.success && !data.landInfo?.success && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Info className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-yellow-700">Không có dữ liệu nào được tải. Vui lòng thử lại.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SunflowerLandData;
