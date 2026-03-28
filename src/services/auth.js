import api from "../lib/axios";

export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post("/user/register", userData);
      return response.data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post("/user/login", credentials);

      console.log("LOGIN RESPONSE:", response.data);

      // Save JWT token
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);

        console.log("Token saved:", response.data.token);
      } else {
        console.error("No token received from backend");
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Remove token locally
      localStorage.removeItem("token");

      const response = await api.post("/user/logout");

      return response.data;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get("/user/profile");
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    try {
      const response = await api.put("/user/update", updates);
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Get user by ID error:", error);
      throw error;
    }
  },

  // Follow/unfollow user
  followUser: async (userId) => {
    try {
      const response = await api.put(`/user/follow/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Follow user error:", error);
      throw error;
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get("/user/all");
      return response.data;
    } catch (error) {
      console.error("Get all users error:", error);
      throw error;
    }
  },
};

// Export alias
export const authApi = authAPI;