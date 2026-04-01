import axios from "axios";

const api = axios.create({
  baseURL: "https://promptverse-backend-q9ao.onrender.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const getStoredToken = () => {
  try {
    // 1. direct token storage
    let token = localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") {
      return token;
    }

    // 2. persisted auth storage
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);

      token =
        parsed?.state?.token ||
        parsed?.state?.accessToken ||
        parsed?.state?.authToken ||
        parsed?.token;

      if (token && token !== "null" && token !== "undefined") {
        return token;
      }
    }

    return null;
  } catch (error) {
    console.error("Error reading token from storage:", error);
    return null;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token attached");
    } else {
      console.log("❌ No valid token found");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("❌ Unauthorized request");
      // keep these disabled while debugging
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;