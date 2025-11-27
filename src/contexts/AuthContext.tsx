import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { login, signup, logout as apiLogout, fetchProfile, setAuthToken, getAuthToken, clearAuth } from '@/api/client';
import type { Profile, AuthResponse } from '@/api/client';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const USER_KEY = 'ai-finance-user';

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Verify token by fetching profile
      refreshProfile();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const { data: profile } = await fetchProfile();
      const cachedRaw = localStorage.getItem(USER_KEY);
      const cached = cachedRaw ? (JSON.parse(cachedRaw) as Profile) : undefined;
      const merged: Profile = {
        id: profile.id || cached?.id || '',
        email: profile.email || cached?.email || '',
        name: profile.name || cached?.name,
        createdAt: profile.createdAt || cached?.createdAt,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      setState({
        user: merged,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        clearAuth();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error.response?.data?.message || 'Failed to load profile',
        });
      } else {
        setState(prev => ({
          user: prev.user,
          isAuthenticated: !!prev.user,
          isLoading: false,
          error: error.message || 'Backend unavailable, please try again',
        }));
      }
    }
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const { data } = await login({ email, password });
      
      // Store token
      setAuthToken(data.token);
      const provisional: Profile = { id: data.user.id, email: data.user.email, name: data.user.name };
      localStorage.setItem(USER_KEY, JSON.stringify(provisional));
      setState(prev => ({
        user: provisional,
        isAuthenticated: true,
        isLoading: true,
        error: null,
      }));

      try {
        const { data: profile } = await fetchProfile();
        const merged: Profile = {
          id: profile.id || provisional.id,
          email: profile.email || provisional.email,
          name: profile.name || provisional.name,
          createdAt: profile.createdAt || provisional.createdAt,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(merged));
        setState({
          user: merged,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        setState({
          user: provisional,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Login failed. Please check your credentials.',
      }));
      throw error;
    }
  }, []);

  const handleSignup = useCallback(async (email: string, password: string, name?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const { data } = await signup({ email, password, name });
      
      // Store token
      setAuthToken(data.token);
      const provisional: Profile = { id: data.user.id, email: data.user.email, name: data.user.name };
      localStorage.setItem(USER_KEY, JSON.stringify(provisional));
      setState(prev => ({
        user: provisional,
        isAuthenticated: true,
        isLoading: true,
        error: null,
      }));

      try {
        const { data: profile } = await fetchProfile();
        const merged: Profile = {
          id: profile.id || provisional.id,
          email: profile.email || provisional.email,
          name: profile.name || provisional.name,
          createdAt: profile.createdAt || provisional.createdAt,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(merged));
        setState({
          user: merged,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        setState({
          user: provisional,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Signup failed. Please try again.',
      }));
      throw error;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem(USER_KEY);
      clearAuth();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

