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
      console.log('Frontend - Starting getListingById for id:', id);
      const token = await AsyncStorage.getItem('@swwap:auth_token');
      console.log('Frontend - Token exists:', !!token);
      
      if (!token) {
        console.log('Frontend - No token found');
        throw new AppError(401, 'Authentication required');
      }

      const url = `${API_URL}/${id}`;
      console.log('Frontend - Making GET request to:', url);
      console.log('Frontend - Request headers:', {
        'Authorization': `Bearer ${token}`,
      });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Frontend - Response status:', response.status);
      console.log('Frontend - Response headers:', response.headers);
      
      const result = await response.json();
      console.log('Frontend - Response body:', result);

      if (!response.ok) {
        console.log('Frontend - Error response:', result);
        throw new AppError(
          response.status,
          result.message || 'Failed to fetch listing'
        );
      }

      console.log('Frontend - Successfully fetched listing');
      return result;
    } catch (error) {
      console.error('Frontend - Error in getListingById:', {
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

  updateListing: async (id: string, data: Partial<Item>): Promise<Item> => {
    try {
      console.log('Frontend - Starting updateListing for id:', id);
      const token = await AsyncStorage.getItem('@swwap:auth_token');
      console.log('Frontend - Token exists:', !!token);
      
      if (!token) {
        console.log('Frontend - No token found');
        throw new AppError(401, 'Authentication required');
      }

      const url = `${API_URL}/${id}`;
      console.log('Frontend - Making PUT request to:', url);
      console.log('Frontend - Request headers:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
      console.log('Frontend - Request body:', data);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Frontend - Response status:', response.status);
      console.log('Frontend - Response headers:', response.headers);
      
      const result = await response.json();
      console.log('Frontend - Response body:', result);

      if (!response.ok) {
        console.log('Frontend - Error response:', result);
        throw new AppError(
          response.status,
          result.message || 'Failed to update listing'
        );
      }

      console.log('Frontend - Successfully updated listing');
      return result;
    } catch (error) {
      console.error('Frontend - Error in updateListing:', {
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

  removeListing: async (id: string): Promise<void> => {
    try {
      console.log('Frontend - Starting removeListing for id:', id);
      const token = await AsyncStorage.getItem('@swwap:auth_token');
      console.log('Frontend - Token exists:', !!token);
      console.log('Frontend - Token value:', token);
      
      if (!token) {
        console.log('Frontend - No token found');
        throw new AppError(401, 'Authentication required');
      }

      const url = `${API_URL}/remove/${id}`;
      console.log('Frontend - Making DELETE request to:', url);
      console.log('Frontend - Request headers:', {
        'Authorization': `Bearer ${token}`,
      });

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Frontend - Response status:', response.status);
      console.log('Frontend - Response headers:', response.headers);
      
      const result = await response.json();
      console.log('Frontend - Response body:', result);

      if (!response.ok) {
        console.log('Frontend - Error response:', result);
        throw new AppError(
          response.status,
          result.message || 'Failed to delete listing'
        );
      }
      console.log('Frontend - Successfully removed listing');
    } catch (error) {
      console.error('Frontend - Error in removeListing:', {
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
}; 