import { LoginInput, SignUpInput, AuthResponse } from '../types/auth';
import { AppError } from '../utils/AppError';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3001/api/auth';

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with:', { email: data.email });
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Login response:', result);

      if (!response.ok) {
        throw new AppError(
          response.status,
          result.message || 'Failed to login'
        );
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to connect to authentication service');
    }
  },

  signUp: async (data: SignUpInput): Promise<AuthResponse> => {
    try {
      console.log('Attempting signup with:', { email: data.email, firstName: data.firstName, lastName: data.lastName });
      const { confirmPassword, ...registerData } = data;
      
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();
      console.log('Signup response:', result);

      if (!response.ok) {
        throw new AppError(
          response.status,
          result.message || 'Failed to register'
        );
      }

      return result;
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to connect to authentication service');
    }
  },

  logout: async (): Promise<void> => {
    try {
      console.log('🔴 AUTH SERVICE: Starting logout process');
      const token = await AsyncStorage.getItem('@swwap:auth_token');
      console.log('🔴 AUTH SERVICE: Token retrieved:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        console.log('🔴 AUTH SERVICE: No token found during logout');
        return;
      }

      console.log('🔴 AUTH SERVICE: Making logout request to:', `${API_URL}/logout`);
      console.log('🔴 AUTH SERVICE: Request headers:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔴 AUTH SERVICE: Logout response status:', response.status);
      const result = await response.json();
      console.log('🔴 AUTH SERVICE: Logout response:', result);

      if (!response.ok) {
        console.error('🔴 AUTH SERVICE: Logout failed with status:', response.status);
        throw new AppError(
          response.status,
          result.message || 'Failed to logout'
        );
      }

      console.log('🔴 AUTH SERVICE: Clearing local storage');
      await Promise.all([
        AsyncStorage.removeItem('@swwap:auth_token'),
        AsyncStorage.removeItem('@swwap:user_data'),
      ]);
      
      console.log('🔴 AUTH SERVICE: Logout successful');
    } catch (error) {
      console.error('🔴 AUTH SERVICE ERROR:', error);
      console.log('🔴 AUTH SERVICE: Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to connect to authentication service');
    }
  },

  updateProfile: async (data: { firstName: string; lastName: string; email: string }): Promise<AuthResponse> => {
    const response = await fetch('http://localhost:3000/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  },
}; 