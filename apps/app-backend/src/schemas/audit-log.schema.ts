import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

export enum AuditAction {
  // Auth
  UserLogin = 'user.login',
  UserLoginFailed = 'user.login_failed',
  UserRegister = 'user.register',
  UserLogout = 'user.logout',
  PasswordChange = 'password.change',
  PasswordReset = 'password.reset',
  TwoFactorEnable = 'two_factor.enable',
  TwoFactorDisable = 'two_factor.disable',

  // Vaults
  VaultCreate = 'vault.create',
  VaultUpdate = 'vault.update',
  VaultDelete = 'vault.delete',
  VaultItemCreate = 'vault_item.create',
  VaultItemUpdate = 'vault_item.update',
  VaultItemDelete = 'vault_item.delete',
  VaultItemAccess = 'vault_item.access',
  VaultItemAttachmentUpload = 'vault_item.attachment_upload',
  VaultItemAttachmentDelete = 'vault_item.attachment_delete',

  // Organizations
  OrgCreate = 'org.create',
  OrgUpdate = 'org.update',
  OrgDelete = 'org.delete',
  OrgMemberInvite = 'org.member_invite',
  OrgMemberRemove = 'org.member_remove',
  OrgMemberRoleUpdate = 'org.member_role_update',

  // Users
  UserProfileUpdate = 'user.profile_update',
  UserDeactivate = 'user.deactivate',
  UserActivate = 'user.activate',
}

@Schema({ timestamps: false, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ type: String, required: true, enum: Object.values(AuditAction) })
  action: AuditAction;

  @Prop({ ref: 'User' })
  userId: string;

  @Prop({ ref: 'Organization' })
  organizationId: string;

  @Prop({ type: String })
  targetType: string;

  @Prop({ type: String })
  targetId: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  ip: string;

  @Prop()
  userAgent: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ organizationId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ timestamp: -1 });
