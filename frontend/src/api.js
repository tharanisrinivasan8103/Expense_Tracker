// frontend/src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // <- exactly this
});

// Attach token automatically
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (err) {}
  return config;
});

export default api;
