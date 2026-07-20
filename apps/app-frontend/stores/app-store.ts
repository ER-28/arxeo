import { create } from "zustand";

interface AppState {
  selectedOrgId: string | null;
  selectedVaultId: string | null;
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;

  setSelectedOrg: (orgId: string | null) => void;
  setSelectedVault: (vaultId: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedOrgId: null,
  selectedVaultId: null,
  sidebarOpen: true,
  mobileSidebarOpen: false,

  setSelectedOrg: (orgId) => set({ selectedOrgId: orgId }),
  setSelectedVault: (vaultId) => set({ selectedVaultId: vaultId }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));
