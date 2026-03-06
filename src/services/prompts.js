import api from "../lib/axios";

export const promptAPI = {
  // Create new prompt
  createPrompt: async (promptData) => {
    const formData = new FormData();

    // Append text fields
    Object.keys(promptData).forEach((key) => {
      if (key === "tags" && Array.isArray(promptData[key])) {
        promptData[key].forEach((tag) => formData.append("tags", tag));
      } else if (key !== "image" && key !== "file") {
        formData.append(key, promptData[key]);
      }
    });

    // Append files
    if (promptData.image) {
      formData.append("image", promptData.image);
    }
    if (promptData.file) {
      formData.append("file", promptData.file);
    }

    const response = await api.post("/promt/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get all prompts
  getAllPrompts: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "all") {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/promt/all?${params.toString()}`);
    return response.data;
  },

  // Get prompt by ID
  getPromptById: async (promptId) => {
    const response = await api.get(`/promt/${promptId}`);
    return response.data;
  },

  // Get my prompts
  getMyPrompts: async () => {
    const response = await api.get("/promt/my-prompts");
    return response.data;
  },

  // Get prompts by user ID
  getPromptsByUserId: async (userId) => {
    const response = await api.get("/promt/all?limit=100"); // Fetch up to 100 prompts
    // Filter by user on the client side since backend doesn't have specific endpoint
    const allPrompts = response.data.prompts || [];
    return allPrompts.filter(
      (prompt) =>
        prompt.createdBy?._id === userId || prompt.createdBy === userId
    );
  },

  // Update prompt
  updatePrompt: async (promptId, updates) => {
    const formData = new FormData();

    Object.keys(updates).forEach((key) => {
      if (key === "tags" && Array.isArray(updates[key])) {
        updates[key].forEach((tag) => formData.append("tags", tag));
      } else if (key !== "image" && key !== "file") {
        formData.append(key, updates[key]);
      }
    });

    if (updates.image) {
      formData.append("image", updates.image);
    }
    if (updates.file) {
      formData.append("file", updates.file);
    }

    const response = await api.put(`/promt/update/${promptId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete prompt
  deletePrompt: async (promptId) => {
    const response = await api.delete(`/promt/delete/${promptId}`);
    return response.data;
  },

  // Like/unlike prompt
  toggleLike: async (promptId) => {
    const response = await api.put(`/promt/like-dislike/${promptId}`);
    return response.data;
  },

  // Add comment to prompt
  addComment: async (promptId, commentData) => {
    const response = await api.post(`/promt/comment/${promptId}`, commentData);
    return response.data;
  },

  // Purchase prompt
  purchasePrompt: async (promptId) => {
    const response = await api.post(`/promt/purchase/${promptId}`);
    return response.data;
  },

  // Download prompt file from Cloudinary URL
  downloadPromptFile: async (fileUrl, filename) => {
    // Direct download from Cloudinary URL
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    return { blob, filename };
  },

  // Toggle follow user
  toggleFollow: async (userId) => {
    const response = await api.post(`/user/follow/${userId}`);
    return response.data;
  },

  // Get prompts with filters and pagination
  getPrompts: async (params) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const response = await api.get(`/promt/all?${queryParams.toString()}`);
    return response.data;
  },
};

// Export as promptsApi for consistency
export const promptsApi = promptAPI;
