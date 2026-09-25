import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default to Render deployment backend or local emulator
export const DEFAULT_BASE_URL = 'http://10.0.2.2:8080/api/v1';

let currentBaseUrl = DEFAULT_BASE_URL;

export const setApiBaseUrl = async (url: string) => {
  currentBaseUrl = url.trim().replace(/\/$/, '');
  await AsyncStorage.setItem('admin_scanner_base_url', currentBaseUrl);
  api.defaults.baseURL = currentBaseUrl;
};

export const getApiBaseUrl = async (): Promise<string> => {
  const saved = await AsyncStorage.getItem('admin_scanner_base_url');
  if (saved) {
    currentBaseUrl = saved;
  }
  return currentBaseUrl;
};

export const api = axios.create({
  baseURL: currentBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('admin_scanner_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const savedUrl = await AsyncStorage.getItem('admin_scanner_base_url');
    if (savedUrl && config.baseURL !== savedUrl) {
      config.baseURL = savedUrl;
    }
  } catch (err) {
    console.error('Request interceptor error', err);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('admin_scanner_token');
      await AsyncStorage.removeItem('admin_scanner_user');
    }
    return Promise.reject(error);
  }
);

export default api;
