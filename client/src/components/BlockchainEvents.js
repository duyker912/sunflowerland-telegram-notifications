import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ExternalLink, 
  Clock, 
  ArrowRight,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

const BlockchainEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real blockchain events from API
      const response = await api.get('/blockchain/events');
      if (response.data.success) {
        setEvents(response.data.events || []);
      } else {
        throw new Error(response.data.error || 'Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching blockchain events:', err);
      setError(`Không thể tải blockchain events: ${err.message}`);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    // Refresh events every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type) => {
    switch (type) {
      case 'Transfer':
        return <ArrowRight className="w-4 h-4 text-blue-500" />;
      case 'Approval':
        return <Zap className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'Transfer':
        return 'bg-blue-50 border-blue-200';
      case 'Approval':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải blockchain events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Blockchain Events</h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {events.length} events
        </span>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className={`border rounded-lg p-4 ${getEventColor(event.type)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getEventIcon(event.type)}
                <span className="font-medium text-gray-900">{event.type}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {event.network}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{formatTimeAgo(event.timestamp)}</span>
              </div>
            </div>

            <div className="space-y-2">
              {event.type === 'Transfer' && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">From:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded">
                    {formatAddress(event.from)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">To:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded">
                    {formatAddress(event.to)}
                  </span>
                </div>
              )}

              {event.type === 'Approval' && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">Owner:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded">
                    {formatAddress(event.from)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Spender:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded">
                    {formatAddress(event.to)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>
                    <span className="font-medium">Amount:</span> {event.value} FLOWER
                  </span>
                  <span>
                    <span className="font-medium">Block:</span> {event.blockNumber.toLocaleString()}
                  </span>
                </div>
                
                <button
                  onClick={() => window.open(`https://basescan.org/tx/${event.transactionHash}`, '_blank')}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <span>View on Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có blockchain events nào</p>
          <p className="text-sm text-gray-400 mt-1">
            Events sẽ xuất hiện khi có giao dịch FLOWER token
          </p>
        </div>
      )}
    </div>
  );
};

export default BlockchainEvents;

