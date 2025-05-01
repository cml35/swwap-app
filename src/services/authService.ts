import { LoginInput, SignUpInput, AuthResponse, MOCK_API_DELAY } from '../types/auth';

// Mock authentication service
export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    
    // This will be replaced with actual API call
    return {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: data.email,
      },
    };
  },

  signUp: async (data: SignUpInput): Promise<AuthResponse> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    
    // This will be replaced with actual API call
    return {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: data.email,
      },
    };
  },
}; 