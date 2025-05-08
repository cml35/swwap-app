import { Item } from '../types';
import { AppError } from '../utils/AppError';
import { apiFetch } from './apiService';

const API_URL = 'http://localhost:3002/api/listings'; // Adjust port as needed

export const listingService = {
  createListing: async (data: Omit<Item, 'id' | 'createdAt' | 'userId'>): Promise<Item> => {
    try {
      console.log('Frontend - Starting createListing');
      console.log('Frontend - Making POST request to:', API_URL);
      console.log('Frontend - Request body:', data);

      const result = await apiFetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Frontend - Successfully created listing');
      return result;
    } catch (error) {
      console.error('Frontend - Error in createListing:', error);
      throw error;
    }
  },

  getListings: async (): Promise<Item[]> => {
    try {
      console.log('Frontend - Making request to:', API_URL);
      const result = await apiFetch(API_URL);
      return result;
    } catch (error) {
      console.error('Frontend - Error in getListings:', error);
      throw error;
    }
  },

  getListingById: async (id: string): Promise<Item> => {
    try {
      console.log('Frontend - Starting getListingById for id:', id);
      const url = `${API_URL}/${id}`;
      console.log('Frontend - Making GET request to:', url);

      const result = await apiFetch(url);
      console.log('Frontend - Successfully fetched listing');
      return result;
    } catch (error) {
      console.error('Frontend - Error in getListingById:', error);
      throw error;
    }
  },

  updateListing: async (id: string, data: Partial<Item>): Promise<Item> => {
    try {
      console.log('Frontend - Starting updateListing for id:', id);
      const url = `${API_URL}/${id}`;
      console.log('Frontend - Making PUT request to:', url);
      console.log('Frontend - Request body:', data);

      const result = await apiFetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Frontend - Successfully updated listing');
      return result;
    } catch (error) {
      console.error('Frontend - Error in updateListing:', error);
      throw error;
    }
  },

  removeListing: async (id: string): Promise<void> => {
    try {
      console.log('Frontend - Starting removeListing for id:', id);
      const url = `${API_URL}/remove/${id}`;
      console.log('Frontend - Making DELETE request to:', url);

      await apiFetch(url, {
        method: 'DELETE',
      });
      console.log('Frontend - Successfully removed listing');
    } catch (error) {
      console.error('Frontend - Error in removeListing:', error);
      throw error;
    }
  },
}; 