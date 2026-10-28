import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, ensureCsrfToken } from '../services/apiClient';

export interface User {
  id: string;
  username: string;
  name_bn: string;
  name_en: string;
  email: string | null;
  phone: string | null;
  status: 'ACTIVE' | 'INVITED' | 'DISABLED';
  preferred_locale: 'bn-BD' | 'en';
  last_login_at: string | null;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (login: string, password: string, doNotRemember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await apiClient.get('/api/v1/me');
      setUser(response.data.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (loginId: string, password: string, doNotRemember: boolean = false) => {
    await ensureCsrfToken();
    await apiClient.post('/login', {
      login: loginId,
      password,
      do_not_remember: doNotRemember,
    });
    await refreshUser();
  };

  const logout = async () => {
    try {
      await apiClient.post('/logout');
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
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
