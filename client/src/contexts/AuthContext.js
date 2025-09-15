import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Fetch user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      toast.success('Đăng nhập thành công!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Đăng nhập thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      toast.success('Đăng ký thành công!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Đăng ký thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Đã đăng xuất');
  };

  const linkTelegram = async (telegramChatId, telegramUsername) => {
    try {
      await api.post('/auth/telegram', { telegram_chat_id: telegramChatId, telegram_username: telegramUsername });
      await fetchUser(); // Refresh user data
      toast.success('Liên kết Telegram thành công!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Liên kết Telegram thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const unlinkTelegram = async () => {
    try {
      await api.delete('/auth/telegram');
      await fetchUser(); // Refresh user data
      toast.success('Hủy liên kết Telegram thành công!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Hủy liên kết Telegram thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateNotificationSettings = async (settings) => {
    try {
      await api.put('/auth/notification-settings', settings);
      await fetchUser(); // Refresh user data
      toast.success('Cập nhật cài đặt thành công!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Cập nhật cài đặt thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    linkTelegram,
    unlinkTelegram,
    updateNotificationSettings,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};