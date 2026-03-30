import axios from "axios";

const api = axios.create({
  baseURL: "https://promptverse-backend-g9ao.onrender.com/api",
  withCredentials: true,
});

/*
  Request interceptor
  Automatically attach JWT token
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token attached to request");
    } else {
      console.log("No token found");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
  Response interceptor
  Handle unauthorized errors
*/

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - removing token");

      localStorage.removeItem("token");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;