import axios from "axios";
import { getAccessToken, clearAuth } from "@/features/auth/stores/auth-store";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach the current access token on every request.
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralized 401/403 handling.
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearAuth();
    }
    return Promise.reject(error);
  }
);