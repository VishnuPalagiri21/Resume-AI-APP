import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';
import { setOnUnauthorized } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register 401 auto logout handler
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
    });
  }, []);

  // Restore stored session on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUserStr = await AsyncStorage.getItem('resumeai_user');
        const token = await AsyncStorage.getItem('resumeai_token');
        if (storedUserStr && token) {
          setUser(JSON.parse(storedUserStr));
        }
      } catch (err) {
        console.error('[AuthContext Restore Error]', err);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password, expectedRole) => {
    const data = await authApi.login(email, password, expectedRole);
    if (data.token) {
      await AsyncStorage.setItem('resumeai_token', data.token);
    }
    if (data.user) {
      await AsyncStorage.setItem('resumeai_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await authApi.signup(payload);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    } finally {
      await AsyncStorage.removeItem('resumeai_token');
      await AsyncStorage.removeItem('resumeai_user');
      setUser(null);
    }
  }, []);

  const setUserState = useCallback((userData) => {
    setUser(userData);
    if (userData) {
      AsyncStorage.setItem('resumeai_user', JSON.stringify(userData));
    } else {
      AsyncStorage.removeItem('resumeai_user');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        setUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
