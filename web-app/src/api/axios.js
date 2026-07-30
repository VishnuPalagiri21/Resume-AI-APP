import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  withCredentials: true, // Send httpOnly cookies automatically with every request
});

// Attach JWT token from localStorage if present (for backward compatibility)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("resumeai_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler — auto logout if token expires
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("resumeai_token");
      localStorage.removeItem("resumeai_user");
      window.location.href = "/";
    }
    // Wrap the Axios error in a real Error so React's unhandled-rejection
    // overlay shows the message string instead of [object Object]
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Request failed";
    const wrappedError = new Error(message);
    wrappedError.response = error.response; // preserve for callers using err.response
    wrappedError.status   = error.response?.status;
    return Promise.reject(wrappedError);
  }
);

export default API;
