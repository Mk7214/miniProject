import axios from 'axios';

// Use environment variables with fallback to backend Vercel URL
const API_URL = import.meta.env.VITE_API_URL || 'https://your-actual-backend-url.vercel.app/api';

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
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        localStorage.setItem('authStatus', 'authenticated');
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
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
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching user data from:', `${API_URL}/auth/me`);
      console.log('Using token:', token ? 'Yes (token exists)' : 'No token found');
      
      const response = await api.get('/auth/me');
      console.log('User data response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to get user data');
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