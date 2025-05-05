import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse } from '../types/auth';
import { authService } from '../services/authService';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthResponse['user'] | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (response: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthResponse['user']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = '@swwap:auth_token';
const USER_DATA_KEY = '@swwap:user_data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('🔵 AUTH CONTEXT: Starting to load stored auth data');
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY),
      ]);

      console.log('🔵 AUTH CONTEXT: Token exists:', !!token);
      console.log('🔵 AUTH CONTEXT: User data exists:', !!userJson);

      if (token && userJson) {
        console.log('🔵 AUTH CONTEXT: Both token and user data found');
        const user = JSON.parse(userJson);
        setState({
          isAuthenticated: true,
          token,
          user,
          isLoading: false,
        });
        console.log('🔵 AUTH CONTEXT: Auth state updated with stored data');
      } else {
        console.log('🔵 AUTH CONTEXT: Missing token or user data');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('🔵 AUTH CONTEXT: Error loading auth data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (response: AuthResponse) => {
    try {
      console.log('🔵 AUTH CONTEXT: Starting login process');
      console.log('🔵 AUTH CONTEXT: Token to store:', response.token);
      console.log('🔵 AUTH CONTEXT: User data to store:', response.user);

      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token),
        AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user)),
      ]);

      console.log('🔵 AUTH CONTEXT: Token and user data stored in AsyncStorage');

      setState({
        isAuthenticated: true,
        token: response.token,
        user: response.user,
        isLoading: false,
      });

      console.log('🔵 AUTH CONTEXT: Auth state updated after login');
    } catch (error) {
      console.error('🔵 AUTH CONTEXT: Error storing auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  };

  const logout = async () => {
    try {
      // Call the logout endpoint
      await authService.logout();

      // Clear local state
      setState({
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if the server call fails, we should still clear local state
      setState({
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: false,
      });
      throw error;
    }
  };

  const updateUser = async (user: AuthResponse['user']) => {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      setState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('Error updating user data:', error);
      throw new Error('Failed to update user data');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 