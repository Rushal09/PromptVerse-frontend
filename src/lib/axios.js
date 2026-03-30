import axios from "axios";

const api = axios.create({
  baseURL: "https://promptverse-backend-q9ao.onrender.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
  Request interceptor
  Attach JWT token
*/
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");

      if (token && token !== "null" && token !== "undefined") {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("✅ Token attached");
      } else {
        console.log("⚠️ No valid token found");
      }

      return config;
    } catch (err) {
      console.error("Token error:", err);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

/*
  Response interceptor
  Handle errors safely
*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("❌ Unauthorized request");

      // 🔴 IMPORTANT: disable auto logout while debugging
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;