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
          <div className="space-y-6">
            {/* SFL Exchange Rates */}
            {data.exchange.data.sfl && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">SFL Exchange Rates</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600">USD</div>
                    <div className="text-lg font-bold text-green-900">
                      ${data.exchange.data.sfl.usd.toFixed(6)}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600">EUR</div>
                    <div className="text-lg font-bold text-blue-900">
                      €{data.exchange.data.sfl.eur.toFixed(6)}
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-sm text-yellow-600">SGD</div>
                    <div className="text-lg font-bold text-yellow-900">
                      S${data.exchange.data.sfl.sgd.toFixed(6)}
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-sm text-red-600">BRL</div>
                    <div className="text-lg font-bold text-red-900">
                      R${data.exchange.data.sfl.brl.toFixed(6)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-600">INR</div>
                    <div className="text-lg font-bold text-purple-900">
                      ₹{data.exchange.data.sfl.inr.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-orange-600">RUB</div>
                    <div className="text-lg font-bold text-orange-900">
                      ₽{data.exchange.data.sfl.rub.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="text-sm text-indigo-600">UAH</div>
                    <div className="text-lg font-bold text-indigo-900">
                      ₴{data.exchange.data.sfl.uah.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4">
                    <div className="text-sm text-pink-600">MATIC</div>
                    <div className="text-lg font-bold text-pink-900">
                      {data.exchange.data.sfl.matic.toFixed(6)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Total Supply</div>
                  <div className="text-lg font-bold text-gray-900">
                    {data.exchange.data.sfl.supply.toLocaleString()} SFL
                  </div>
                </div>
              </div>
            )}

            {/* MATIC Exchange Rates */}
            {data.exchange.data.matic && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">MATIC Exchange Rates</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600">USD</div>
                    <div className="text-lg font-bold text-green-900">
                      ${data.exchange.data.matic.usd.toFixed(6)}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600">EUR</div>
                    <div className="text-lg font-bold text-blue-900">
                      €{data.exchange.data.matic.eur.toFixed(6)}
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-sm text-yellow-600">SGD</div>
                    <div className="text-lg font-bold text-yellow-900">
                      S${data.exchange.data.matic.sgd.toFixed(6)}
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-sm text-red-600">BRL</div>
                    <div className="text-lg font-bold text-red-900">
                      R${data.exchange.data.matic.brl.toFixed(6)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-600">INR</div>
                    <div className="text-lg font-bold text-purple-900">
                      ₹{data.exchange.data.matic.inr.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-orange-600">RUB</div>
                    <div className="text-lg font-bold text-orange-900">
                      ₽{data.exchange.data.matic.rub.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="text-sm text-indigo-600">UAH</div>
                    <div className="text-lg font-bold text-indigo-900">
                      ₴{data.exchange.data.matic.uah.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4">
                    <div className="text-sm text-pink-600">SFL</div>
                    <div className="text-lg font-bold text-pink-900">
                      {data.exchange.data.matic.sfl.toFixed(6)}
                    </div>
                  </div>
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
          <div className="space-y-6">
            {/* NFT Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600">Total Collectibles</div>
                <div className="text-2xl font-bold text-blue-900">
                  {data.nfts.data.collectibles?.length || 0}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600">Total Wearables</div>
                <div className="text-2xl font-bold text-purple-900">
                  {data.nfts.data.wearables?.length || 0}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600">Last Updated</div>
                <div className="text-sm font-medium text-green-900">
                  {formatDate(data.nfts.data.updatedAt)}
                </div>
              </div>
            </div>

            {/* Top Collectibles */}
            {data.nfts.data.collectibles && data.nfts.data.collectibles.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Top Collectibles (by Floor Price)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.nfts.data.collectibles
                    .filter(nft => nft.floor > 0)
                    .sort((a, b) => b.floor - a.floor)
                    .slice(0, 9)
                    .map((nft) => (
                    <div key={nft.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">ID: {nft.id}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {nft.collection}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Floor:</span>
                          <span className="font-medium text-green-600">{nft.floor} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Sale:</span>
                          <span className="font-medium text-blue-600">{nft.lastSalePrice} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supply:</span>
                          <span className="font-medium text-gray-900">{nft.supply.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Wearables */}
            {data.nfts.data.wearables && data.nfts.data.wearables.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Top Wearables (by Floor Price)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.nfts.data.wearables
                    .filter(nft => nft.floor > 0)
                    .sort((a, b) => b.floor - a.floor)
                    .slice(0, 9)
                    .map((nft) => (
                    <div key={nft.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">ID: {nft.id}</span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {nft.collection}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Floor:</span>
                          <span className="font-medium text-green-600">{nft.floor} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Sale:</span>
                          <span className="font-medium text-blue-600">{nft.lastSalePrice} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supply:</span>
                          <span className="font-medium text-gray-900">{nft.supply.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                <h4 className="font-semibold text-gray-900 mb-3">Resources ({Object.keys(data.landBoosts.data.resources).length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(data.landBoosts.data.resources).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-lg p-3 border">
                      <div className="font-medium capitalize text-gray-900 mb-2">{key}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min:</span>
                          <span className="font-medium text-red-600">{value.min}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max:</span>
                          <span className="font-medium text-green-600">{value.max}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg:</span>
                          <span className="font-medium text-blue-600">{value.avg.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Crops */}
            {data.landBoosts.data.crops && Object.keys(data.landBoosts.data.crops).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Crops ({Object.keys(data.landBoosts.data.crops).length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(data.landBoosts.data.crops).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-lg p-3 border">
                      <div className="font-medium capitalize text-gray-900 mb-2">{key}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min:</span>
                          <span className="font-medium text-red-600">{value.min}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max:</span>
                          <span className="font-medium text-green-600">{value.max}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg:</span>
                          <span className="font-medium text-blue-600">{value.avg.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fruits */}
            {data.landBoosts.data.fruits && Object.keys(data.landBoosts.data.fruits).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Fruits ({Object.keys(data.landBoosts.data.fruits).length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(data.landBoosts.data.fruits).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-lg p-3 border">
                      <div className="font-medium capitalize text-gray-900 mb-2">{key}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min:</span>
                          <span className="font-medium text-red-600">{value.min}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max:</span>
                          <span className="font-medium text-green-600">{value.max}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg:</span>
                          <span className="font-medium text-blue-600">{value.avg.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Animals */}
            {data.landBoosts.data.animals && Object.keys(data.landBoosts.data.animals).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Animals ({Object.keys(data.landBoosts.data.animals).length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(data.landBoosts.data.animals).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-lg p-3 border">
                      <div className="font-medium capitalize text-gray-900 mb-2">{key}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min:</span>
                          <span className="font-medium text-red-600">{value.min}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max:</span>
                          <span className="font-medium text-green-600">{value.max}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg:</span>
                          <span className="font-medium text-blue-600">{value.avg.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Greenhouse */}
            {data.landBoosts.data.greenhouse && Object.keys(data.landBoosts.data.greenhouse).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Greenhouse ({Object.keys(data.landBoosts.data.greenhouse).length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(data.landBoosts.data.greenhouse).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-lg p-3 border">
                      <div className="font-medium capitalize text-gray-900 mb-2">{key}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min:</span>
                          <span className="font-medium text-red-600">{value.min}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max:</span>
                          <span className="font-medium text-green-600">{value.max}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg:</span>
                          <span className="font-medium text-blue-600">{value.avg.toFixed(2)}</span>
                        </div>
                      </div>
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
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600">Total Resources</div>
                <div className="text-2xl font-bold text-blue-900">
                  {Object.keys(data.landSummary.data.resources || {}).length}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600">Total Crops</div>
                <div className="text-2xl font-bold text-green-900">
                  {Object.keys(data.landSummary.data.crops || {}).length}
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-yellow-600">Total Fruits</div>
                <div className="text-2xl font-bold text-yellow-900">
                  {Object.keys(data.landSummary.data.fruits || {}).length}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600">Greenhouse Items</div>
                <div className="text-2xl font-bold text-purple-900">
                  {Object.keys(data.landSummary.data.greenhouse || {}).length}
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Top Resources (by Avg)</h4>
                <div className="space-y-2">
                  {Object.entries(data.landSummary.data.resources || {})
                    .sort((a, b) => b[1].avg - a[1].avg)
                    .slice(0, 5)
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="capitalize text-gray-700">{key}</span>
                        <span className="font-medium text-blue-600">{value.avg.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Top Crops (by Avg)</h4>
                <div className="space-y-2">
                  {Object.entries(data.landSummary.data.crops || {})
                    .sort((a, b) => b[1].avg - a[1].avg)
                    .slice(0, 5)
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="capitalize text-gray-700">{key}</span>
                        <span className="font-medium text-green-600">{value.avg.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
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
