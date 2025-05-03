import { Item } from '../types';
import { AppError } from '../utils/AppError';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3002/api/listings'; // Adjust port as needed

export const listingService = {
  createListing: async (data: Omit<Item, 'id' | 'createdAt' | 'userId'>): Promise<Item> => {
    try {
      const token = await AsyncStorage.getItem('@swwap:auth_token');
      if (!token) {
        throw new AppError(401, 'Authentication required');
      }

      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new AppError(
          response.status,
          result.message || 'Failed to create listing'
        );
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to connect to listing service');
    }
  },

  getListings: async (): Promise<Item[]> => {
    try {
      const token = await AsyncStorage.getItem('@swwap:auth_token');
      console.log('Frontend - Token from storage:', token);
      
      if (!token) {
        console.log('Frontend - No token found in storage');
        throw new AppError(401, 'Authentication required');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      console.log('Frontend - Request headers:', headers);
      console.log('Frontend - Making request to:', API_URL);

      const response = await fetch(`${API_URL}`, {
        headers,
      });

      console.log('Frontend - Response status:', response.status);
      const result = await response.json();
      console.log('Frontend - Response body:', result);

      if (!response.ok) {
        throw new AppError(
          response.status,
          result.message || 'Failed to fetch listings'
        );
      }

      return result;
    } catch (error) {
      console.error('Frontend - Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to connect to listing service');
    }
  },

  getListingById: async (id: string): Promise<Item> => {
    try {
      const token = await AsyncStorage.getItem('@swwap:auth_token');
      if (!token) {
        throw new AppError(401, 'Authentication required');
      }

      const response = await fetch(`${API_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new AppError(
          response.status,
          result.message || 'Failed to fetch listing'
        );
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to connect to listing service');
    }
  },

  updateListing: async (id: string, data: Partial<Item>): Promise<Item> => {
    try {
      const token = await AsyncStorage.getItem('@swwap:auth_token');
      if (!token) {
        throw new AppError(401, 'Authentication required');
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new AppError(
          response.status,
          result.message || 'Failed to update listing'
        );
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to connect to listing service');
    }
  },

  deleteListing: async (id: string): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('@swwap:auth_token');
      if (!token) {
        throw new AppError(401, 'Authentication required');
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new AppError(
          response.status,
          result.message || 'Failed to delete listing'
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to connect to listing service');
    }
  },
}; 