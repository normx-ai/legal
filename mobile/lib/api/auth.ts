import { api } from "./client";
import type {
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthResponse,
  OtpResponse,
  MessageResponse,
} from "@/types/auth";

export const authApi = {
  login: (data: LoginPayload) => api.post<AuthResponse>("/auth/login", data),
  register: (data: RegisterPayload) => api.post<AuthResponse>("/auth/register", data),
  verifyOtp: (data: VerifyOtpPayload) => api.post<AuthResponse>("/auth/verify-otp", data),
  sendOtpEmail: (email: string) => api.post<OtpResponse>("/auth/send-otp-email", { email }),
  forgotPassword: (data: ForgotPasswordPayload) => api.post<OtpResponse>("/auth/forgot-password", data),
  resetPassword: (data: ResetPasswordPayload) => api.post<MessageResponse>("/auth/reset-password", data),
  logout: () => api.post("/auth/logout"),
};
