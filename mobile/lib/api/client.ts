import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3004/api";
export { API_URL };

const isWeb = typeof window !== "undefined" && typeof sessionStorage !== "undefined";
const isMobile = !isWeb;

let _getToken: () => Promise<string | null>;
let _getRefreshToken: () => Promise<string | null>;
let _setToken: (key: string, value: string) => Promise<void>;
let _removeToken: (key: string) => Promise<void>;

if (isWeb) {
  _getToken = async () => null;
  _getRefreshToken = async () => null;
  _setToken = async () => {};
  _removeToken = async () => {};
} else {
  _getToken = async () => {
    const { getItemAsync } = require("expo-secure-store");
    return getItemAsync("accessToken");
  };
  _getRefreshToken = async () => {
    const { getItemAsync } = require("expo-secure-store");
    return getItemAsync("refreshToken");
  };
  _setToken = async (key, value) => {
    const { setItemAsync } = require("expo-secure-store");
    return setItemAsync(key, value);
  };
  _removeToken = async (key) => {
    const { deleteItemAsync } = require("expo-secure-store");
    return deleteItemAsync(key);
  };
}

export { isWeb, isMobile };
export const storage = { get: _getToken, set: _setToken, remove: _removeToken };

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  try {
    const { useAuthStore } = require("@/lib/store/auth");
    const user = useAuthStore.getState().user;
    if (user?.entreprise_id) {
      config.headers["X-Organization-ID"] = user.entreprise_id;
    }
  } catch {}

  if (isMobile) {
    config.headers["X-Platform"] = "mobile";
    try {
      const token = await _getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
  } else {
    try {
      const csrfToken = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((c) => c.startsWith("csrf-token="))
          ?.split("=")[1] || ""
      ) || undefined;
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    } catch {}
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string | null) => void; reject: (err: unknown) => void }[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
}

async function forceLogout(reason?: "revoked" | "expired") {
  if (isMobile) {
    try { await _removeToken("accessToken"); } catch {}
    try { await _removeToken("refreshToken"); } catch {}
  } else {
    try { await axios.post(`${API_URL}/auth/clear-session`, {}, { withCredentials: true }); } catch {}
  }
  const { useAuthStore } = require("@/lib/store/auth");
  useAuthStore.getState().setSessionExpired(true, reason || "expired");
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _skipAuthRetry?: boolean };

    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest._skipAuthRetry ||
      originalRequest.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (isMobile && token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      if (isMobile) {
        const refreshToken = await _getRefreshToken();
        if (!refreshToken) {
          await forceLogout();
          return Promise.reject(error);
        }
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        await _setToken("accessToken", data.token);
        if (data.refreshToken) await _setToken("refreshToken", data.refreshToken);
        processQueue(null, data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } else {
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        processQueue(null, data.token);
        return api(originalRequest);
      }
    } catch (refreshError) {
      processQueue(refreshError, null);
      await forceLogout("expired");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
