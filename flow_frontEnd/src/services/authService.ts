import axios from "axios";

// Use environment variables with fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/";

// Initialize: Check if user data exists in localStorage on module load
(() => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      localStorage.setItem("authStatus", "authenticated");
    } else {
      // Only clear auth status, keep other data for potential recovery
      localStorage.removeItem("authStatus");
    }
  } catch (error) {
    console.error("Error checking auth initialization:", error);
  }
})();

export interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
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
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor for adding auth token and logging
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to the Authorization header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    //console.log('Making request to:', config.url);
    //console.log('With headers:', config.headers);
    //console.log('With cookies:', document.cookie);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    // console.log('Response received:', response.data);
    return response;
  },
  (error) => {
    console.error("Response error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export const authService = {
  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/signup", userData);
      if (response.data.success) {
        localStorage.setItem("authStatus", "authenticated");
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.data.success) {
        // Store authentication status
        localStorage.setItem("authStatus", "authenticated");

        // Handle token storage
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);

          // Store user info if available
          if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        } else {
          console.warn("No token received in login response");
        }
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("authStatus");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout error:", error);
      // Still remove local storage items even if the server request fails
      localStorage.removeItem("authStatus");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  },

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const authStatus = localStorage.getItem("authStatus");
    return !!(token && user && authStatus === "authenticated");
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      const authStatus = localStorage.getItem("authStatus");

      console.log("Auth check - Token exists:", !!token);
      console.log("Auth check - User data exists:", !!user);
      console.log("Auth check - Auth status:", authStatus);

      // If we have both token and user data, try to fetch fresh data
      if (token && user) {
        try {
          const response = await api.get("/auth/me");
          if (response.data.success && response.data.user) {
            // Update stored user data
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("authStatus", "authenticated");
            return {
              success: true,
              user: response.data.user
            };
          }
        } catch (error) {
          console.error("Error fetching fresh user data:", error);
          // If the API call fails but we have cached data, use that
          if (user && authStatus === "authenticated") {
            const parsedUser = JSON.parse(user);
            return {
              success: true,
              user: parsedUser
            };
          }
        }
      }

      // If we have cached user data and auth status, use that
      if (user && authStatus === "authenticated") {
        const parsedUser = JSON.parse(user);
        return {
          success: true,
          user: parsedUser
        };
      }

      // If we have a token but no user data, try to fetch user data
      if (token && !user) {
        try {
          const response = await api.get("/auth/me");
          if (response.data.success && response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("authStatus", "authenticated");
            return {
              success: true,
              user: response.data.user
            };
          }
        } catch (error) {
          console.error("Error fetching user data with token:", error);
        }
      }

      throw new Error("No authentication data found");
    } catch (error: any) {
      console.error("Get current user error:", error);

      if (error.response?.status === 401) {
        // Clear all auth data on 401
        localStorage.removeItem("authStatus");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to get user data"
      );
    }
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
