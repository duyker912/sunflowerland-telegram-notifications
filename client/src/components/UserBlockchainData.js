import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Coins, 
  TrendingUp, 
  Link, 
  Unlink,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const UserBlockchainData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    walletAddress: '',
    flowerBalance: '0',
    sunflowerFarmId: '',
    blockchainNetwork: 'base'
  });
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch real user data from API
      const response = await api.get('/auth/me');
      if (response.data.user) {
        setUserData({
          walletAddress: response.data.user.wallet_address || '',
          flowerBalance: response.data.user.flower_balance || '0',
          sunflowerFarmId: response.data.user.sunflower_player_id || '',
          blockchainNetwork: 'base'
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Lỗi khi tải dữ liệu blockchain');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkWallet = async () => {
    try {
      setLinking(true);
      
      // Check if MetaMask is available
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        
        // Update user data via API
        const response = await api.put('/auth/update-wallet', {
          wallet_address: walletAddress
        });
        
        if (response.data.success) {
          setUserData(prev => ({
            ...prev,
            walletAddress: walletAddress
          }));
          toast.success('Đã liên kết ví thành công!');
        } else {
          throw new Error(response.data.error || 'Failed to link wallet');
        }
      } else {
        throw new Error('MetaMask không được cài đặt');
      }
    } catch (error) {
      console.error('Error linking wallet:', error);
      toast.error(`Lỗi khi liên kết ví: ${error.message}`);
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkWallet = async () => {
    try {
      // Update user data via API
      const response = await api.put('/auth/update-wallet', {
        wallet_address: null
      });
      
      if (response.data.success) {
        setUserData(prev => ({
          ...prev,
          walletAddress: '',
          flowerBalance: '0'
        }));
        toast.success('Đã hủy liên kết ví');
      } else {
        throw new Error(response.data.error || 'Failed to unlink wallet');
      }
    } catch (error) {
      console.error('Error unlinking wallet:', error);
      toast.error(`Lỗi khi hủy liên kết ví: ${error.message}`);
    }
  };

  const handleLinkFarm = async () => {
    try {
      setLinking(true);
      
      // Prompt user for farm ID
      const farmId = prompt('Nhập Farm ID của bạn từ Sunflower Land:');
      if (!farmId) {
        setLinking(false);
        return;
      }
      
      // Update user data via API
      const response = await api.put('/auth/update-farm', {
        sunflower_player_id: farmId
      });
      
      if (response.data.success) {
        setUserData(prev => ({
          ...prev,
          sunflowerFarmId: farmId
        }));
        toast.success('Đã liên kết farm thành công!');
      } else {
        throw new Error(response.data.error || 'Failed to link farm');
      }
    } catch (error) {
      console.error('Error linking farm:', error);
      toast.error(`Lỗi khi liên kết farm: ${error.message}`);
    } finally {
      setLinking(false);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(userData.walletAddress);
      setCopied(true);
      toast.success('Đã copy địa chỉ ví');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Lỗi khi copy địa chỉ');
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Chưa liên kết';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Wallet className="w-8 h-8 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Blockchain Data</h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {userData.blockchainNetwork}
        </span>
      </div>

      {/* Wallet Address */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Wallet className="w-6 h-6 text-blue-500 mr-2" />
            <h4 className="text-lg font-medium">Địa chỉ ví</h4>
          </div>
          {userData.walletAddress ? (
            <button
              onClick={handleUnlinkWallet}
              className="flex items-center px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              <Unlink className="w-4 h-4 mr-1" />
              Hủy liên kết
            </button>
          ) : (
            <button
              onClick={handleLinkWallet}
              disabled={linking}
              className="flex items-center px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
            >
              <Link className="w-4 h-4 mr-1" />
              {linking ? 'Đang liên kết...' : 'Liên kết ví'}
            </button>
          )}
        </div>
        
        {userData.walletAddress ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <span className="font-mono text-sm">{userData.walletAddress}</span>
              <button
                onClick={handleCopyAddress}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Hiển thị: {formatAddress(userData.walletAddress)}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Chưa liên kết ví blockchain</p>
        )}
      </div>

      {/* FLOWER Balance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Coins className="w-6 h-6 text-yellow-500 mr-2" />
          <h4 className="text-lg font-medium">Số dư FLOWER</h4>
        </div>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {parseFloat(userData.flowerBalance).toLocaleString()}
          </p>
          <p className="text-gray-600 mt-1">FLOWER Tokens</p>
          {userData.walletAddress && (
            <p className="text-sm text-gray-500 mt-2">
              Cập nhật từ blockchain
            </p>
          )}
        </div>
      </div>

      {/* Sunflower Farm */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
            <h4 className="text-lg font-medium">Sunflower Farm</h4>
          </div>
          {userData.sunflowerFarmId ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Đã liên kết
            </span>
          ) : (
            <button
              onClick={handleLinkFarm}
              disabled={linking}
              className="flex items-center px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
            >
              <Link className="w-4 h-4 mr-1" />
              {linking ? 'Đang liên kết...' : 'Liên kết Farm'}
            </button>
          )}
        </div>
        
        {userData.sunflowerFarmId ? (
          <div className="space-y-2">
            <p className="font-mono text-sm bg-gray-50 p-2 rounded">
              {userData.sunflowerFarmId}
            </p>
            <p className="text-sm text-gray-600">
              Farm ID đã được liên kết với tài khoản của bạn
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Chưa liên kết Sunflower Land farm</p>
        )}
      </div>

      {/* Network Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-medium mb-4">Thông tin mạng</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Mạng chính</p>
            <p className="font-medium capitalize">{userData.blockchainNetwork}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trạng thái</p>
            <p className="font-medium text-green-600">Đã kết nối</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBlockchainData;

