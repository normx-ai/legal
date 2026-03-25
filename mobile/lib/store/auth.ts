import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storage, isWeb, isMobile, api } from "../api/client";
import type { User, AuthStep } from "@/types/auth";

interface AuthState {
  user: User | null;
  email: string;
  otpCode: string;
  step: AuthStep;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  sessionExpiredReason: "expired" | "revoked";
  rememberMe: boolean;

  setUser: (user: User | null) => void;
  setEmail: (email: string) => void;
  setOtpCode: (code: string) => void;
  setStep: (step: AuthStep) => void;
  setLoading: (loading: boolean) => void;
  setSessionExpired: (expired: boolean, reason?: "expired" | "revoked") => void;
  setRememberMe: (rememberMe: boolean) => void;
  login: (user: User, token?: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
  verifyToken: () => Promise<void>;
}

const zustandStorage = createJSONStorage(() => ({
  getItem: async (key: string) => {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      return sessionStorage.getItem(key);
    }
    const { getItemAsync } = require("expo-secure-store");
    return getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(key, value);
      return;
    }
    const { setItemAsync } = require("expo-secure-store");
    return setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(key);
      return;
    }
    const { deleteItemAsync } = require("expo-secure-store");
    return deleteItemAsync(key);
  },
}));

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      email: "",
      otpCode: "",
      step: "email",
      isAuthenticated: false,
      isLoading: false,
      sessionExpired: false,
      sessionExpiredReason: "expired",
      rememberMe: false,

      setUser: (user) => set({ user }),
      setEmail: (email) => set({ email }),
      setOtpCode: (otpCode) => set({ otpCode }),
      setStep: (step) => set({ step }),
      setLoading: (isLoading) => set({ isLoading }),
      setSessionExpired: (sessionExpired, reason) =>
        set({ sessionExpired, sessionExpiredReason: reason || "expired" }),
      setRememberMe: (rememberMe) => set({ rememberMe }),

      login: async (user, token, refreshToken) => {
        if (isMobile) {
          if (token) await storage.set("accessToken", token);
          if (refreshToken) await storage.set("refreshToken", refreshToken);
        }
        set({ user, isAuthenticated: true, sessionExpired: false });
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {}
        if (isMobile) {
          await storage.remove("accessToken");
          await storage.remove("refreshToken");
        }
        set({
          user: null,
          isAuthenticated: false,
          sessionExpired: false,
          rememberMe: false,
          email: "",
          otpCode: "",
          step: "email",
        });
      },

      reset: () => set({ email: "", otpCode: "", step: "email" }),

      verifyToken: async () => {
        if (!get().isAuthenticated) return;
        if (isMobile) {
          try {
            const token = await storage.get();
            if (!token) set({ user: null, isAuthenticated: false, step: "email" });
          } catch {
            set({ user: null, isAuthenticated: false, step: "email" });
          }
        }
        if (isWeb) {
          try {
            await api.get("/user/profile", { _skipAuthRetry: true } as any);
          } catch {
            set({ user: null, isAuthenticated: false, step: "email" });
          }
        }
      },
    }),
    {
      name: "normx-legal-auth",
      storage: zustandStorage,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
      onRehydrateStorage: () => (state) => {
        state?.verifyToken();
      },
    },
  ),
);
