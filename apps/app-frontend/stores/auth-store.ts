import { create } from "zustand";
import { User } from "@/types";
import { setTokens, loadTokens, clearTokens } from "@/lib/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  is2FARequired: boolean;
  pending2FAUserId: string | null;

  init: () => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  require2FA: (userId: string) => void;
  clear2FA: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  is2FARequired: false,
  pending2FAUserId: null,

  init: () => {
    const storedUser = localStorage.getItem("arxeo_user");
    const { accessToken, refreshToken } = loadTokens();
    if (storedUser && accessToken && refreshToken) {
      set({
        user: JSON.parse(storedUser),
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
    }
  },

  login: (user, accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken);
    localStorage.setItem("arxeo_user", JSON.stringify(user));
    set({ user, accessToken, refreshToken, isAuthenticated: true, is2FARequired: false, pending2FAUserId: null });
  },

  logout: () => {
    clearTokens();
    localStorage.removeItem("arxeo_user");
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    localStorage.setItem("arxeo_user", JSON.stringify(user));
    set({ user });
  },

  require2FA: (userId) => {
    set({ is2FARequired: true, pending2FAUserId: userId });
  },

  clear2FA: () => {
    set({ is2FARequired: false, pending2FAUserId: null });
  },
}));
