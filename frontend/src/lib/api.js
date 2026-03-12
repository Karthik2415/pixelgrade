import axios from "axios";

// Create Axios instance with base URL from env
const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include JWT token
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

export default api;
