import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppError } from '../utils/AppError';

const AUTH_TOKEN_KEY = '@swwap:auth_token';

// Create a wrapper for fetch that handles token expiration
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    
    // Add authorization header if token exists
    const headers = {
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401) {
      // Clear auth data
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem('@swwap:user_data'),
      ]);

      // Dispatch a custom event that the app can listen to
      const event = new CustomEvent('auth:tokenExpired');
      window.dispatchEvent(event);

      throw new AppError(401, 'Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new AppError(
        response.status,
        data.message || 'An error occurred'
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to connect to the server');
  }
}; 