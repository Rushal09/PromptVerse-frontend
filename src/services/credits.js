git add README.mdimport api from "../lib/axios";

export const creditAPI = {
  // Get user balance
  getBalance: async () => {
    const response = await api.get("/credit/balance");
    return response.data;
  },

  // Get credit history
  getCreditHistory: async (page = 1, limit = 20) => {
    const response = await api.get(
      `/credit/history?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Create credit transaction
  createCredit: async (creditData) => {
    const response = await api.post("/credit/create", creditData);
    return response.data;
  },

  // Check and credit popular prompts
  checkCreditPopularPrompts: async (promptId) => {
    const response = await api.post(`/credit/check-credit/${promptId}`);
    return response.data;
  },
};
