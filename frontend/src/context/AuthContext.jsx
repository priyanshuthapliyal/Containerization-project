import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user: userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      setLoading(false);
      return userData;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error on backend:', error.message);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    }
  };

  // Reset password handler
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      await api.put('/auth/reset-password', { currentPassword, newPassword });
      
      const updatedUser = { ...user, isPasswordReset: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || 'Password update failed';
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
