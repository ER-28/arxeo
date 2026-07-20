import { API_BASE_URL } from "./constants";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access;
  refreshToken = refresh;
  if (access && refresh) {
    localStorage.setItem("arxeo_access_token", access);
    localStorage.setItem("arxeo_refresh_token", refresh);
  } else {
    localStorage.removeItem("arxeo_access_token");
    localStorage.removeItem("arxeo_refresh_token");
  }
}

export function loadTokens() {
  const access = localStorage.getItem("arxeo_access_token");
  const refresh = localStorage.getItem("arxeo_refresh_token");
  accessToken = access;
  refreshToken = refresh;
  return { accessToken: access, refreshToken: refresh };
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("arxeo_access_token");
  localStorage.removeItem("arxeo_refresh_token");
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${accessToken}`);
      res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as Record<string, unknown>).message || res.statusText;
    throw new ApiError(typeof message === "string" ? message : String(message), res.status);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

export const authApi = {
  register: (data: { email: string; username: string; password: string; firstName?: string; lastName?: string }) =>
    api("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { identifier: string; password: string; twoFactorCode?: string }) =>
    api("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  refresh: (refreshToken: string) =>
    api("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) }),

  logout: (refreshToken: string) =>
    api("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }),

  forgotPassword: (email: string) =>
    api("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (data: { token: string; password: string }) =>
    api("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),

  verifyEmail: (token: string) =>
    api("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }),

  verify2FA: (data: { userId: string; code: string }) =>
    api("/auth/verify-2fa", { method: "POST", body: JSON.stringify(data) }),

  profile: () => api("/auth/profile"),

  updateProfile: (data: { firstName?: string; lastName?: string; email?: string }) =>
    api("/auth/profile", { method: "PATCH", body: JSON.stringify(data) }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api("/auth/change-password", { method: "POST", body: JSON.stringify(data) }),

  exportData: () => api("/auth/export-data"),

  deleteAccount: (password: string) =>
    api("/auth/delete-account", { method: "POST", body: JSON.stringify({ password }) }),
};

export const orgApi = {
  list: () => api("/organizations"),

  get: (orgId: string) => api(`/organizations/${orgId}`),

  create: (data: { name: string; description?: string }) =>
    api("/organizations", { method: "POST", body: JSON.stringify(data) }),

  update: (orgId: string, data: { name?: string; description?: string }) =>
    api(`/organizations/${orgId}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (orgId: string) =>
    api(`/organizations/${orgId}`, { method: "DELETE" }),

  members: (orgId: string) => api(`/organizations/${orgId}/members`),

  updateMemberRole: (orgId: string, userId: string, role: string) =>
    api(`/organizations/${orgId}/members/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  removeMember: (orgId: string, userId: string) =>
    api(`/organizations/${orgId}/members/${userId}`, { method: "DELETE" }),

  invite: (orgId: string, data: { email: string; role?: string }) =>
    api(`/organizations/${orgId}/invite`, { method: "POST", body: JSON.stringify(data) }),

  invitations: (orgId: string) => api(`/organizations/${orgId}/invitations`),

  createInvitation: (orgId: string, data: { email: string; role: string }) =>
    api(`/organizations/${orgId}/invitations`, { method: "POST", body: JSON.stringify(data) }),

  revokeInvitation: (orgId: string, inviteId: string) =>
    api(`/organizations/${orgId}/invitations/${inviteId}`, { method: "DELETE" }),

  acceptInvitation: (token: string) =>
    api(`/organizations/invitations/${token}/accept`, { method: "POST" }),
};

export const vaultApi = {
  list: (orgId: string) => api(`/organizations/${orgId}/vaults`),

  get: (vaultId: string) => api(`/vaults/${vaultId}`),

  create: (orgId: string, data: { name: string; description?: string; isShared?: boolean }) =>
    api(`/organizations/${orgId}/vaults`, { method: "POST", body: JSON.stringify(data) }),

  update: (vaultId: string, data: { name?: string; description?: string; isShared?: boolean }) =>
    api(`/vaults/${vaultId}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (vaultId: string) =>
    api(`/vaults/${vaultId}`, { method: "DELETE" }),

  share: (vaultId: string, data: { userIds: string[] }) =>
    api(`/vaults/${vaultId}/share`, { method: "POST", body: JSON.stringify(data) }),

  unshare: (vaultId: string, data: { userIds: string[] }) =>
    api(`/vaults/${vaultId}/unshare`, { method: "POST", body: JSON.stringify(data) }),

  sharees: (vaultId: string) => api(`/vaults/${vaultId}/sharees`),

  items: {
    list: (vaultId: string, search?: string) => {
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      return api(`/vaults/${vaultId}/items${q}`);
    },
    get: (itemId: string) => api(`/items/${itemId}`),
    create: (vaultId: string, data: Record<string, unknown>) =>
      api(`/vaults/${vaultId}/items`, { method: "POST", body: JSON.stringify(data) }),
    update: (itemId: string, data: Record<string, unknown>) =>
      api(`/items/${itemId}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (itemId: string) =>
      api(`/items/${itemId}`, { method: "DELETE" }),
    history: (itemId: string) => api(`/items/${itemId}/history`),

    uploadAttachment: (itemId: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api(`/items/${itemId}/attachments`, { method: "POST", body: formData });
    },
    getAttachmentUrl: (itemId: string, objectName: string) =>
      api<{ url: string }>(`/items/${itemId}/attachments/${objectName}`),
    deleteAttachment: (itemId: string, objectName: string) =>
      api(`/items/${itemId}/attachments/${objectName}`, { method: "DELETE" }),
  },
};

export const twoFactorApi = {
  setup: () => api("/2fa/setup"),
  enable: (code: string) => api("/2fa/enable", { method: "POST", body: JSON.stringify({ code }) }),
  disable: (code: string) => api("/2fa/disable", { method: "POST", body: JSON.stringify({ code }) }),
  status: () => api("/2fa/status"),
};

export const apiKeyApi = {
  list: () => api("/api-keys"),
  create: (data: { name: string; scopes?: string[]; expiresAt?: string }) =>
    api("/api-keys", { method: "POST", body: JSON.stringify(data) }),
  revoke: (id: string) => api(`/api-keys/${id}`, { method: "DELETE" }),
};

export const auditApi = {
  myLogs: (page = 1, limit = 50) =>
    api(`/audit/me?page=${page}&limit=${limit}`),
  orgLogs: (orgId: string, page = 1, limit = 50) =>
    api(`/audit/org/${orgId}?page=${page}&limit=${limit}`),
};

export const searchApi = {
  global: (q: string) => api(`/search?q=${encodeURIComponent(q)}`),
  vault: (vaultId: string, q: string) =>
    api(`/search/vaults/${vaultId}?q=${encodeURIComponent(q)}`),
};

export const securityApi = {
  checkBreach: (password: string) =>
    api("/security/check-breach", { method: "POST", body: JSON.stringify({ password }) }),
};

export const toolsApi = {
  generatePassword: (options?: {
    length?: number;
    uppercase?: boolean;
    lowercase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
    excludeAmbiguous?: boolean;
  }) =>
    api("/tools/generate-password", { method: "POST", body: JSON.stringify(options ?? {}) }),
};

export const importExportApi = {
  importBitwarden: (vaultId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api(`/vaults/${vaultId}/import/bitwarden`, { method: "POST", body: formData });
  },
  exportBitwarden: (vaultId: string) =>
    api(`/vaults/${vaultId}/export/bitwarden`),
  exportJson: (vaultId: string) =>
    api(`/vaults/${vaultId}/export/json`),
};
