import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Dynamic development host resolution for Web, Physical Phones (Expo Go), Android Emulator, and iOS
export const getBaseUrl = () => {
  // 1. Allow explicit override via Expo public env variable
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname || 'localhost';
      return `http://${hostname}:5000`;
    }
    return 'http://localhost:5000';
  }

  // 2. Detect developer PC host IP dynamically from Expo server configuration
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000`;
    }
  }

  if (Platform.OS === 'android') {
    // Android emulator fallback
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
};

const API = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
});

// Interceptor to inject JWT token into Authorization header
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('resumeai_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('[API Interceptor Error]', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error unwrapping
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('resumeai_token');
      await AsyncStorage.removeItem('resumeai_user');
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Request failed';
    const wrappedError = new Error(message);
    wrappedError.response = error.response;
    wrappedError.status = error.response?.status;
    return Promise.reject(wrappedError);
  }
);

export default API;
