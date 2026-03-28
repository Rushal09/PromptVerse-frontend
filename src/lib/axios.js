import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR — attach JWT token
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR — handle errors safely
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.log("Unauthorized — clearing token");

      // remove invalid token
      localStorage.removeItem("token");

      // prevent reload loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      toast.error("Session expired. Please login again.");
    }

    else if (status === 403) {
      toast.error("Access denied.");
    }

    else if (status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }

    else if (error.message === "Network Error") {
      toast.error("Network error. Please check your connection.");
    }

    else {
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

export default api;