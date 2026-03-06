import api from "../lib/axios";

export const userAPI = {
  // Get all users
  getAllUsers: async () => {
    const response = await api.get("/user/all");
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  // Get user by ID (for profile pages)
  getUserById: async (userId) => {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put("/user/update", userData);
    return response.data;
  },

  // Follow/Unfollow a user
  toggleFollowUser: async (userId) => {
    const response = await api.put(`/user/follow/${userId}`);
    return response.data;
  },
};
