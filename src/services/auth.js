import api from "../lib/axios";

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post("/user/register", userData);
    return response.data;
  },

  // Login user
 login: async (credentials) => {
  const response = await api.post("/user/login", credentials);

  // Save JWT token
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
},
  // Logout user
logout: async () => {
  localStorage.removeItem("token");

  const response = await api.post("/user/logout");
  return response.data;
},

  // Get current user profile
  getProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (updates) => {
    const response = await api.put("/user/update", updates);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  },

  // Follow/unfollow user
  followUser: async (userId) => {
    const response = await api.put(`/user/follow/${userId}`);
    return response.data;
  },

  // Get all users
  getAllUsers: async () => {
    const response = await api.get("/user/all");
    return response.data;
  },
};

// Export as authApi for consistency
export const authApi = authAPI;
