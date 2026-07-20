export interface User {
  _id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  instanceRole: "superadmin" | "user";
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthLoginResponse extends AuthTokens {
  user: User;
  requires2FA?: boolean;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  plan: "free" | "standard" | "pro" | "enterprise";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type OrgRole = "owner" | "admin" | "member" | "viewer";

export interface OrganizationMember {
  _id: string;
  userId: string | User;
  organizationId: string;
  role: OrgRole;
  joinedAt: string;
}

export interface Invitation {
  _id: string;
  email: string;
  organizationId: string;
  role: OrgRole;
  invitedBy: string | User;
  token: string;
  expiresAt: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  createdAt: string;
}

export interface Vault {
  _id: string;
  name: string;
  description?: string;
  organizationId: string;
  isShared: boolean;
  sharedWithUserIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VaultItemType = "login" | "secure_note" | "card" | "identity";

export interface VaultItemAttachment {
  objectName: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface VaultItem {
  _id: string;
  title: string;
  type: VaultItemType;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  tags: string[];
  isFavorite: boolean;
  isActive: boolean;
  vaultId: string;
  organizationId: string;
  attachments: VaultItemAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultItemVersion {
  _id: string;
  itemId: string;
  version: number;
  snapshot: Partial<VaultItem>;
  changedBy: string;
  createdAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  organizationId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  userId: string;
  organizationId?: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ApiKey {
  _id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface SearchResult {
  vaults: Vault[];
  items: VaultItem[];
  organizations: Organization[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface HealthStatus {
  status: "ok" | "error";
  services: {
    mongodb: { status: string; latencyMs: number };
    redis: { status: string };
    minio: { status: string };
  };
}

export const Permission = {
  VAULT_CREATE: "vault:create",
  VAULT_READ: "vault:read",
  VAULT_UPDATE: "vault:update",
  VAULT_DELETE: "vault:delete",
  ORG_MANAGE: "org:manage",
  ORG_READ: "org:read",
  ORG_DELETE: "org:delete",
  MEMBERS_MANAGE: "members:manage",
  MEMBERS_READ: "members:read",
  MEMBERS_INVITE: "members:invite",
  MEMBERS_REMOVE: "members:remove",
  SETTINGS_MANAGE: "settings:manage",
  SETTINGS_READ: "settings:read",
  BILLING_MANAGE: "billing:manage",
  BILLING_READ: "billing:read",
  INSTANCE_MANAGE: "instance:manage",
  INSTANCE_USERS_MANAGE: "instance:users:manage",
  INSTANCE_SETTINGS_MANAGE: "instance:settings:manage",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
