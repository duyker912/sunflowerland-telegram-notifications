import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Coins, 
  Network, 
  Eye, 
  EyeOff, 
  RefreshCw,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import BlockchainEvents from './BlockchainEvents';
import UserBlockchainData from './UserBlockchainData';

const BlockchainDashboard = () => {
  const [blockchainData, setBlockchainData] = useState({
    networks: {},
    tokenInfo: null,
    farmContracts: [],
    monitoringStatus: { totalContracts: 0, networks: {} }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blockchain data
  const fetchBlockchainData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real data from Railway API
      const response = await fetch('/api/blockchain/test-all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const realData = await response.json();
      setBlockchainData(realData);
      
    } catch (err) {
      console.error('Error fetching blockchain data:', err);
      setError(`Không thể kết nối đến blockchain API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  // Start monitoring
  const startMonitoring = async () => {
    try {
      const response = await fetch('/api/blockchain/start-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        // Refresh data to get updated monitoring status
        await fetchBlockchainData();
        alert('✅ Bắt đầu monitor blockchain events!');
      } else {
        throw new Error(result.error || 'Failed to start monitoring');
      }
    } catch (err) {
      console.error('Error starting monitoring:', err);
      setError(`Không thể bắt đầu monitoring: ${err.message}`);
    }
  };

  // Stop monitoring
  const stopMonitoring = async () => {
    try {
      const response = await fetch('/api/blockchain/stop-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        // Refresh data to get updated monitoring status
        await fetchBlockchainData();
        alert('🛑 Đã dừng monitor blockchain events!');
      } else {
        throw new Error(result.error || 'Failed to stop monitoring');
      }
    } catch (err) {
      console.error('Error stopping monitoring:', err);
      setError(`Không thể dừng monitoring: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading blockchain data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchBlockchainData}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blockchain Dashboard</h2>
          <p className="text-gray-600">Monitor Sunflower Land on Base & Polygon networks</p>
        </div>
        <button
          onClick={fetchBlockchainData}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Network Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Base Network */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Network className="w-6 h-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold">Base Network</h3>
            </div>
            <div className={`w-3 h-3 rounded-full ${blockchainData.networks?.base?.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          
          {blockchainData.networks?.base?.success ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Chain ID:</span> {blockchainData.networks.base.data?.chainId || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Block:</span> {blockchainData.networks.base.data?.blockNumber?.toLocaleString() || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Gas Price:</span> {blockchainData.networks.base.data?.gasPrice || 'N/A'}
              </p>
            </div>
          ) : (
            <p className="text-red-500 text-sm">
              {blockchainData.networks?.base?.error || 'Connection failed'}
            </p>
          )}
        </div>

        {/* Polygon Network */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Network className="w-6 h-6 text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold">Polygon Network</h3>
            </div>
            <div className={`w-3 h-3 rounded-full ${blockchainData.networks?.polygon?.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          
          {blockchainData.networks?.polygon?.success ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Chain ID:</span> {blockchainData.networks.polygon.data?.chainId || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Block:</span> {blockchainData.networks.polygon.data?.blockNumber?.toLocaleString() || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Gas Price:</span> {blockchainData.networks.polygon.data?.gasPrice || 'N/A'}
              </p>
            </div>
          ) : (
            <p className="text-red-500 text-sm">
              {blockchainData.networks?.polygon?.error || 'Connection failed'}
            </p>
          )}
        </div>
      </div>

      {/* FLOWER Token Info */}
      {blockchainData.tokenInfo && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Coins className="w-6 h-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold">FLOWER Token</h3>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              {blockchainData.tokenInfo.network || 'N/A'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{blockchainData.tokenInfo.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Symbol</p>
              <p className="font-medium">{blockchainData.tokenInfo.symbol || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Supply</p>
              <p className="font-medium">
                {blockchainData.tokenInfo.totalSupply ? 
                  parseFloat(blockchainData.tokenInfo.totalSupply).toLocaleString() : 
                  'N/A'
                }
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">Contract Address</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">
              {blockchainData.tokenInfo.address || 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Event Monitoring */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Eye className="w-6 h-6 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold">Event Monitoring</h3>
          </div>
          <div className="flex items-center space-x-2">
            {blockchainData.monitoringStatus.totalContracts > 0 ? (
              <button
                onClick={stopMonitoring}
                className="flex items-center px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                <EyeOff className="w-4 h-4 mr-1" />
                Stop
              </button>
            ) : (
              <button
                onClick={startMonitoring}
                className="flex items-center px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                <Eye className="w-4 h-4 mr-1" />
                Start
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Active Contracts</p>
            <p className="text-2xl font-bold text-green-600">
              {blockchainData.monitoringStatus.totalContracts}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Networks</p>
            <div className="flex space-x-2">
              {Object.keys(blockchainData.monitoringStatus.networks).map(network => (
                <span key={network} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {network}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Farm Contracts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold">Discovered Farm Contracts</h3>
        </div>
        
        {blockchainData.farmContracts && blockchainData.farmContracts.length > 0 ? (
          <div className="space-y-3">
            {blockchainData.farmContracts.map((farm, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{farm.name || 'Unknown Farm'}</p>
                    <p className="text-sm text-gray-600">{farm.type || 'Unknown Type'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {farm.verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Verified
                      </span>
                    )}
                    {farm.sources && farm.sources.length > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {farm.sources.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <p className="font-mono text-sm text-gray-500 mt-2">
                  {farm.address || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Không tìm thấy farm contracts nào
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {blockchainData.farmContracts?.length || 0}
          </p>
          <p className="text-gray-600">Farm Contracts</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {blockchainData.monitoringStatus?.totalContracts || 0}
          </p>
          <p className="text-gray-600">Active Monitors</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Network className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {blockchainData.networks ? 
              Object.keys(blockchainData.networks).filter(network => 
                blockchainData.networks[network]?.success
              ).length : 0
            }
          </p>
          <p className="text-gray-600">Connected Networks</p>
        </div>
      </div>

      {/* User Blockchain Data */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <UserBlockchainData />
      </div>

      {/* Blockchain Events */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <BlockchainEvents />
      </div>
    </div>
  );
};

export default BlockchainDashboard;
