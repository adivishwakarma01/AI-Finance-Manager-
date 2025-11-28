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

  const refreshProfile = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const { data: profile } = await fetchProfile();
      setState({
        user: profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // Token might be invalid, clear it
      clearAuth();
      
      // Don't show error for invalid tokens on mount (normal flow)
      const shouldShowError = error.response?.status !== 401 && error.response?.status !== 403;
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: shouldShowError ? (error.response?.data?.message || 'Failed to load profile') : null,
      });
    }
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Verify token by fetching profile
      refreshProfile();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const { data } = await login({ email, password });
      
      // Store token
      setAuthToken(data.token);
      
      // Fetch and store user profile
      const { data: profile } = await fetchProfile();
      
      setState({
        user: profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        error.message ||
        (error.code === 'ERR_NETWORK' ? 'Network error. Please check if the backend server is running.' : 'Login failed. Please check your credentials.');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
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
      
      // Fetch and store user profile
      const { data: profile } = await fetchProfile();
      
      setState({
        user: profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        error.message ||
        (error.code === 'ERR_NETWORK' ? 'Network error. Please check if the backend server is running.' : 'Signup failed. Please try again.');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
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

