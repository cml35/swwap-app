import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse } from '../types/auth';

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
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY),
      ]);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        setState({
          isAuthenticated: true,
          token,
          user,
          isLoading: false,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (response: AuthResponse) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token),
        AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user)),
      ]);

      setState({
        isAuthenticated: true,
        token: response.token,
        user: response.user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_DATA_KEY),
      ]);

      setState({
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error removing auth data:', error);
      throw new Error('Failed to remove authentication data');
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