import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

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

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
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
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post('/signup', data);
    if (response.data.success) {
      // Set a flag in localStorage to indicate successful signup
      localStorage.setItem('authStatus', 'authenticated');
    }
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/login', data);
    if (response.data.success) {
      // Set a flag in localStorage to indicate successful login
      localStorage.setItem('authStatus', 'authenticated');
    }
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
    localStorage.removeItem('authStatus');
  },

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    // Check both cookie and localStorage
    return document.cookie.includes('token=') || localStorage.getItem('authStatus') === 'authenticated';
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      console.log('Fetching user data from:', `${API_URL}/me`);
      console.log('Current cookies:', document.cookie);
      
      const response = await api.get('/me');
      console.log('User data response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        console.error('Error config:', error.config);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  }
}; 