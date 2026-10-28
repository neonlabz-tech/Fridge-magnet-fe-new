import api from "@/lib/axios";
import { LoginPayload, RegisterPayload } from "@/lib/data";
import { AxiosError } from "axios";

function extractErrorMessage(err: unknown, fallback: string): Error {
  if (err instanceof AxiosError) {
    if (!err.response) {
      return new Error("Unable to reach the server. Please check your connection and try again.");
    }
    const data = err.response?.data as { message?: string | string[] } | undefined;
    const msg = data?.message;
    if (Array.isArray(msg)) return new Error(msg[0] ?? fallback);
    if (typeof msg === "string") return new Error(msg);
  }
  return new Error(fallback);
}

export const authApi = {
  async register(data: RegisterPayload) {
    try {
      const res = await api.post("/auth/register", data);
      return res.data;
    } catch (err) {
      throw extractErrorMessage(err, "Registration failed. Please try again.");
    }
  },

  async login(data: LoginPayload) {
    try {
      const res = await api.post("/auth/login", data);
      if (res.data.token) {
        document.cookie = `token=${res.data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      }
      return res.data;
    } catch (err) {
      throw extractErrorMessage(err, "Login failed. Please try again.");
    }
  },

  async getCurrentUser() {
    try {
      const res = await api.get("/auth/profile");
      return res.data;
    } catch (err) {
      throw extractErrorMessage(err, "Could not load profile.");
    }
  },

  async updateProfile(data: {
    fullName?: string;
    phoneNumber?: string;
    customerAddress?: string;
  }) {
    try {
      const res = await api.patch("/auth/profile", data);
      return res.data;
    } catch (err) {
      throw extractErrorMessage(err, "Could not update profile.");
    }
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await api.post("/auth/change-password", data);
    } catch (err) {
      throw extractErrorMessage(err, "Could not change password.");
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post("/auth/forgot-password", { email });
    } catch (err) {
      throw extractErrorMessage(err, "Could not process request.");
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post("/auth/reset-password", { token, newPassword });
    } catch (err) {
      throw extractErrorMessage(err, "Could not reset password.");
    }
  },

  async activateAccount(token: string): Promise<{ alreadyActivated?: boolean }> {
    try {
      const res = await api.patch(`/customers/token/${token}`, { isActive: true });
      return { alreadyActivated: Boolean(res.data?.data?.alreadyActivated) };
    } catch (err) {
      throw extractErrorMessage(err, "Account activation failed. Please try again.");
    }
  },
};