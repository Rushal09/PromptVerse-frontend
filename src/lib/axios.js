import axios from "axios";

const api = axios.create({
  baseURL: "https://promptverse-backend-q9ao.onrender.com/api",
  withCredentials: true,
});

const getStoredToken = () => {
  try {
    let token = localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") return token;

    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      token =
        parsed?.state?.token ||
        parsed?.state?.accessToken ||
        parsed?.state?.authToken ||
        parsed?.token;

      if (token && token !== "null" && token !== "undefined") return token;
    }

    return null;
  } catch (error) {
    console.error("Error reading token:", error);
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

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
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
    }
    return Promise.reject(error);
  }
);

export default api;