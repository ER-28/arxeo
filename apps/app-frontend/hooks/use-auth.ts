"use client";

import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const { user, isAuthenticated, is2FARequired, pending2FAUserId, login, logout, updateUser, require2FA, clear2FA } =
    useAuthStore();

  const isSuperAdmin = user?.instanceRole === "superadmin";

  return {
    user,
    isAuthenticated,
    isSuperAdmin,
    is2FARequired,
    pending2FAUserId,
    login,
    logout,
    updateUser,
    require2FA,
    clear2FA,
  };
}
