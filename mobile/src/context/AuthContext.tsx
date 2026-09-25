import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getApiBaseUrl, setApiBaseUrl, DEFAULT_BASE_URL } from '../api/client';
import { AdminUser } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  baseUrl: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateBaseUrl: (newUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [baseUrl, setBaseUrlState] = useState<string>(DEFAULT_BASE_URL);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedUrl = await getApiBaseUrl();
        setBaseUrlState(savedUrl);

        const savedToken = await AsyncStorage.getItem('admin_scanner_token');
        const savedUserStr = await AsyncStorage.getItem('admin_scanner_user');

        if (savedToken && savedUserStr) {
          const parsedUser = JSON.parse(savedUserStr);
          if (parsedUser.role === 'ROLE_ADMIN') {
            setToken(savedToken);
            setUser(parsedUser);
          } else {
            await AsyncStorage.removeItem('admin_scanner_token');
            await AsyncStorage.removeItem('admin_scanner_user');
          }
        }
      } catch (err) {
        console.error('Auth bootstrap failed', err);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    const data = res.data?.data;
    const tokenVal = data?.token || data?.accessToken;
    const userVal = data?.user;

    if (!tokenVal || !userVal) {
      throw new Error('Invalid login response from server.');
    }

    if (userVal.role !== 'ROLE_ADMIN') {
      throw new Error('Access denied. Administrator privileges are required to use this scanner.');
    }

    setToken(tokenVal);
    setUser(userVal);

    await AsyncStorage.setItem('admin_scanner_token', tokenVal);
    await AsyncStorage.setItem('admin_scanner_user', JSON.stringify(userVal));
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('admin_scanner_token');
      await AsyncStorage.removeItem('admin_scanner_user');
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const updateBaseUrl = async (newUrl: string) => {
    await setApiBaseUrl(newUrl);
    setBaseUrlState(newUrl);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        baseUrl,
        login,
        logout,
        updateBaseUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
