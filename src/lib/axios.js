import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://promptverse-backend-q9ao.onrender.com/api"
      : "http://localhost:3001/api",

  withCredentials: true,
});

/*
  REQUEST INTERCEPTOR
  Automatically attach JWT token
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
  RESPONSE INTERCEPTOR
  Handle unauthorized errors
*/

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - clearing token");

      localStorage.removeItem("token");

      // redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;