export enum Permission {
  // Vault
  VaultCreate = 'vault:create',
  VaultRead = 'vault:read',
  VaultUpdate = 'vault:update',
  VaultDelete = 'vault:delete',

  // Organization
  OrgManage = 'org:manage',
  OrgRead = 'org:read',
  OrgDelete = 'org:delete',

  // Members
  MembersManage = 'members:manage',
  MembersRead = 'members:read',
  MembersInvite = 'members:invite',
  MembersRemove = 'members:remove',

  // Settings
  SettingsManage = 'settings:manage',
  SettingsRead = 'settings:read',

  // Billing (self-hosted or cloud)
  BillingManage = 'billing:manage',
  BillingRead = 'billing:read',

  // Instance admin
  InstanceManage = 'instance:manage',
  InstanceUsersManage = 'instance:users:manage',
  InstanceSettingsManage = 'instance:settings:manage',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Org roles
  owner: [
    Permission.VaultCreate,
    Permission.VaultRead,
    Permission.VaultUpdate,
    Permission.VaultDelete,
    Permission.OrgManage,
    Permission.OrgRead,
    Permission.OrgDelete,
    Permission.MembersManage,
    Permission.MembersRead,
    Permission.MembersInvite,
    Permission.MembersRemove,
    Permission.SettingsManage,
    Permission.SettingsRead,
    Permission.BillingManage,
    Permission.BillingRead,
  ],
  admin: [
    Permission.VaultCreate,
    Permission.VaultRead,
    Permission.VaultUpdate,
    Permission.VaultDelete,
    Permission.OrgRead,
    Permission.MembersManage,
    Permission.MembersRead,
    Permission.MembersInvite,
    Permission.MembersRemove,
    Permission.SettingsRead,
    Permission.BillingRead,
  ],
  member: [
    Permission.VaultCreate,
    Permission.VaultRead,
    Permission.VaultUpdate,
    Permission.VaultDelete,
    Permission.OrgRead,
    Permission.MembersRead,
    Permission.SettingsRead,
  ],
  viewer: [
    Permission.VaultRead,
    Permission.OrgRead,
    Permission.MembersRead,
    Permission.SettingsRead,
  ],
};
