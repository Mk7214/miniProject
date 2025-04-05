import axios from 'axios';

// Use environment variables with fallback to backend Vercel URL
const API_URL = import.meta.env.VITE_API_URL || 'https://flow-backend.vercel.app/api';

// Initialize: Check if user data exists in localStorage on module load
(() => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      console.log('Found existing auth data on initialization');
      localStorage.setItem('authStatus', 'authenticated');
    } else {
      console.log('No existing auth data found on initialization');
    }
  } catch (error) {
    console.error('Error checking auth initialization:', error);
  }
})();

interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  name: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Add request interceptor for adding auth token and logging
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('Making request to:', config.url);
    console.log('With headers:', config.headers);
    console.log('With cookies:', document.cookie);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authService = {
  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/signup', userData);
      if (response.data.success) {
        localStorage.setItem('authStatus', 'authenticated');
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      console.log('Attempting login with:', { email: credentials.email, passwordProvided: !!credentials.password });
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        // Store authentication status
        localStorage.setItem('authStatus', 'authenticated');
        
        // Handle token storage
        if (response.data.token) {
          console.log('Token received, storing in localStorage');
          localStorage.setItem('token', response.data.token);
          
          // Store user info if available
          if (response.data.user) {
            console.log('User data received, storing in localStorage');
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } else {
          console.warn('No token received in login response');
        }
        
        // Verify token was saved correctly
        const savedToken = localStorage.getItem('token');
        console.log('Saved token verification:', savedToken ? 'Token saved successfully' : 'Failed to save token');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('authStatus');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove local storage items even if the server request fails
      localStorage.removeItem('authStatus');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    // Check both cookie and localStorage
    return document.cookie.includes('token=') || 
           localStorage.getItem('authStatus') === 'authenticated' ||
           !!localStorage.getItem('token');
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('token');
      const authStatus = localStorage.getItem('authStatus');
      const user = localStorage.getItem('user');
      
      console.log('Auth check - Token exists:', !!token);
      console.log('Auth check - Auth status:', authStatus);
      console.log('Auth check - User data exists:', !!user);
      
      if (!token) {
        // Try to use existing user data if available
        if (user && authStatus === 'authenticated') {
          console.log('No token, but using cached user data');
          return {
            success: true,
            user: JSON.parse(user)
          };
        }
        
        console.error('No authentication token found and no cached user data');
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching user data from:', `${API_URL}/auth/me`);
      console.log('Using token:', token.substring(0, 10) + '...');
      
      const response = await api.get('/auth/me');
      console.log('User data response:', response.data);
      
      // Cache the user data
      if (response.data.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      
      // Check if we have cached user data as fallback
      const user = localStorage.getItem('user');
      const authStatus = localStorage.getItem('authStatus');
      
      if (user && authStatus === 'authenticated') {
        console.log('Using cached user data due to API error');
        return {
          success: true,
          user: JSON.parse(user)
        };
      }
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        
        // Handle specific error cases
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('authStatus');
        }
      } 
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to get user data');
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}; 