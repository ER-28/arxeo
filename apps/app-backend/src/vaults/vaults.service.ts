import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  Vault,
  VaultDocument,
  VaultItem,
  VaultItemDocument,
  OrganizationMember,
  OrganizationMemberDocument,
  VaultItemVersion,
  VaultItemVersionDocument,
} from '../schemas';
import { Permission, ROLE_PERMISSIONS, OrgRole } from '../enums';
import { CreateVaultDto, UpdateVaultDto, CreateVaultItemDto, UpdateVaultItemDto } from './dto';
import { MinioService } from '../minio/minio.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../schemas/audit-log.schema';

@Injectable()
export class VaultsService {
  constructor(
    @InjectModel(Vault.name) private vaultModel: Model<VaultDocument>,
    @InjectModel(VaultItem.name) private itemModel: Model<VaultItemDocument>,
    @InjectModel(OrganizationMember.name)
    private memberModel: Model<OrganizationMemberDocument>,
    @InjectModel(VaultItemVersion.name)
    private versionModel: Model<VaultItemVersionDocument>,
    private readonly minioService: MinioService,
    private readonly auditService: AuditService,
  ) {}

  // ─── Vaults ─────────────────────────────────────

  async createVault(dto: CreateVaultDto, userId: string) {
    await this.requirePermission(
      dto.organizationId,
      userId,
      Permission.VaultCreate,
    );

    const vault = await this.vaultModel.create({
      name: dto.name,
      description: dto.description,
      organizationId: dto.organizationId,
      createdBy: userId,
      isShared: dto.isShared || false,
    });

    this.auditService.log({
      action: AuditAction.VaultCreate,
      userId,
      organizationId: dto.organizationId,
      targetType: 'Vault',
      targetId: vault._id.toString(),
      metadata: { name: dto.name },
    }).catch(() => {});

    return vault;
  }

  async getVaults(orgId: string, userId: string) {
    await this.requirePermission(orgId, userId, Permission.VaultRead);

    const membership = await this.memberModel.findOne({
      userId,
      organizationId: orgId,
      isActive: true,
    });

    if (!membership) throw new ForbiddenException('Not a member');

    if (membership.role === OrgRole.Viewer) {
      return this.vaultModel.find({
        organizationId: orgId,
        isActive: true,
        $or: [
          { isShared: true },
          { sharedWithUserIds: userId },
          { createdBy: userId },
        ],
      });
    }

    return this.vaultModel.find({ organizationId: orgId, isActive: true });
  }

  async getVault(vaultId: string, userId: string) {
    const vault = await this.vaultModel.findById(vaultId);
    if (!vault || !vault.isActive) {
      throw new NotFoundException('Vault not found');
    }

    await this.requirePermission(
      vault.organizationId,
      userId,
      Permission.VaultRead,
    );

    return vault;
  }

  async updateVault(vaultId: string, dto: UpdateVaultDto, userId: string) {
    const vault = await this.vaultModel.findById(vaultId);
    if (!vault) throw new NotFoundException('Vault not found');

    await this.requirePermission(
      vault.organizationId,
      userId,
      Permission.VaultUpdate,
    );

    const updated = await this.vaultModel.findByIdAndUpdate(vaultId, dto, {
      new: true,
    });
    return updated;
  }

  async deleteVault(vaultId: string, userId: string) {
    const vault = await this.vaultModel.findById(vaultId);
    if (!vault) throw new NotFoundException('Vault not found');

    await this.requirePermission(
      vault.organizationId,
      userId,
      Permission.VaultDelete,
    );

    // Soft-delete all items
    await this.itemModel.updateMany(
      { vaultId },
      { isActive: false },
    );

    vault.isActive = false;
    await vault.save();

    this.auditService.log({
      action: AuditAction.VaultDelete,
      userId,
      organizationId: vault.organizationId,
      targetType: 'Vault',
      targetId: vaultId,
    }).catch(() => {});

    return { message: 'Vault deleted' };
  }

  // ─── Vault Items ────────────────────────────────

  async createItem(
    vaultId: string,
    dto: CreateVaultItemDto,
    userId: string,
  ) {
    const vault = await this.vaultModel.findById(vaultId);
    if (!vault || !vault.isActive) {
      throw new NotFoundException('Vault not found');
    }

    await this.requirePermission(
      vault.organizationId,
      userId,
      Permission.VaultCreate,
    );

    const item = await this.itemModel.create({
      vaultId,
      organizationId: vault.organizationId,
      title: dto.title,
      username: dto.username,
      password: dto.password,
      url: dto.url,
      notes: dto.notes,
      type: dto.type || 'login',
      tags: dto.tags || [],
      isFavorite: dto.isFavorite || false,
      createdBy: userId,
    });

    await this.vaultModel.findByIdAndUpdate(vaultId, {
      $inc: { itemCount: 1 },
    });

    this.auditService.log({
      action: AuditAction.VaultItemCreate,
      userId,
      organizationId: vault.organizationId,
      targetType: 'VaultItem',
      targetId: item._id.toString(),
      metadata: { title: dto.title, vaultId },
    }).catch(() => {});

    return item;
  }

  async getItems(vaultId: string, userId: string, search?: string) {
    const vault = await this.vaultModel.findById(vaultId);
    if (!vault || !vault.isActive) {
      throw new NotFoundException('Vault not found');
    }

    await this.requirePermission(
      vault.organizationId,
      userId,
      Permission.VaultRead,
    );

    const query: any = { vaultId, isActive: true };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
      ];
    }

    return this.itemModel.find(query).sort({ isFavorite: -1, title: 1 });
  }

  async getItem(itemId: string, userId: string) {
    const item = await this.itemModel.findById(itemId);
    if (!item || !item.isActive) {
      throw new NotFoundException('Item not found');
    }

    await this.requirePermission(
      item.organizationId,
      userId,
      Permission.VaultRead,
    );

    item.lastAccessedAt = new Date();
    await item.save();

    this.auditService.log({
      action: AuditAction.VaultItemAccess,
      userId,
      organizationId: item.organizationId,
      targetType: 'VaultItem',
      targetId: itemId,
    }).catch(() => {});

    return item;
  }

  async updateItem(
    itemId: string,
    dto: UpdateVaultItemDto,
    userId: string,
  ) {
    const item = await this.itemModel.findById(itemId);
    if (!item) throw new NotFoundException('Item not found');

    await this.requirePermission(
      item.organizationId,
      userId,
      Permission.VaultUpdate,
    );

    // Create version snapshot before update
    const latestVersion = await this.versionModel
      .findOne({ itemId })
      .sort({ version: -1 })
      .lean();
    const nextVersion = (latestVersion?.version || 0) + 1;

    await this.versionModel.create({
      itemId,
      organizationId: item.organizationId,
      version: nextVersion,
      snapshot: {
        title: item.title,
        username: item.username,
        password: item.password,
        url: item.url,
        notes: item.notes,
        tags: item.tags,
        type: item.type,
        customFields: item.customFields ? Object.fromEntries(item.customFields) : undefined,
        isFavorite: item.isFavorite,
      },
      changedBy: userId,
      changedAt: new Date(),
    });

    const updated = await this.itemModel.findByIdAndUpdate(itemId, dto, {
      new: true,
    });
    return updated;
  }

  async getItemHistory(itemId: string, userId: string) {
    const item = await this.itemModel.findById(itemId);
    if (!item) throw new NotFoundException('Item not found');

    await this.requirePermission(
      item.organizationId,
      userId,
      Permission.VaultRead,
    );

    return this.versionModel
      .find({ itemId })
      .sort({ changedAt: -1 })
      .limit(50)
      .lean();
  }

  async deleteItem(itemId: string, userId: string) {
    const item = await this.itemModel.findById(itemId);
    if (!item) throw new NotFoundException('Item not found');

    await this.requirePermission(
      item.organizationId,
      userId,
      Permission.VaultDelete,
    );

    item.isActive = false;
    await item.save();

    await this.vaultModel.findByIdAndUpdate(item.vaultId, {
      $inc: { itemCount: -1 },
    });

    return { message: 'Item deleted' };
  }

  // ─── Vault Sharing ──────────────────────────────

  async shareVault(vaultId: string, userIds: string[], requestedBy: string) {
    const vault = await this.vaultModel.findById(vaultId);
    if (!vault) throw new NotFoundException('Vault not found');

    await this.requirePermission(vault.organizationId, requestedBy, Permission.VaultUpdate);

    const newShared = [...new Set([...(vault.sharedWithUserIds || []), ...userIds])];
    vault.sharedWithUserIds = newShared;
    vault.isShared = true;
    await vault.save();

    return { sharedWithUserIds: vault.sharedWithUserIds };
  }

  async unshareVault(vaultId: string, userIds: string[], requestedBy: string) {
    const vault = await this.vaultModel.findById(vaultId);
    if (!vault) throw new NotFoundException('Vault not found');

    await this.requirePermission(vault.organizationId, requestedBy, Permission.VaultUpdate);

    vault.sharedWithUserIds = (vault.sharedWithUserIds || []).filter(
      (id) => !userIds.includes(id),
    );
    vault.isShared = (vault.sharedWithUserIds?.length || 0) > 0;
    await vault.save();

    return { sharedWithUserIds: vault.sharedWithUserIds };
  }

  async getVaultSharees(vaultId: string, userId: string) {
    const vault = await this.vaultModel.findById(vaultId);
    if (!vault) throw new NotFoundException('Vault not found');

    await this.requirePermission(vault.organizationId, userId, Permission.VaultRead);

    return { sharedWithUserIds: vault.sharedWithUserIds || [] };
  }

  // ─── Attachments ─────────────────────────────────

  async addAttachment(
    itemId: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    const item = await this.itemModel.findById(itemId);
    if (!item || !item.isActive) throw new NotFoundException('Item not found');

    await this.requirePermission(item.organizationId, userId, Permission.VaultUpdate);

    const ext = file.originalname.split('.').pop() || '';
    const objectName = `vault-items/${item.vaultId}/${itemId}/${uuidv4()}.${ext}`;

    await this.minioService.uploadFile(objectName, file.buffer, file.mimetype);

    const attachment = {
      objectName,
      originalName: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      uploadedBy: userId,
      uploadedAt: new Date(),
    };

    await this.itemModel.findByIdAndUpdate(itemId, {
      $push: { attachments: attachment },
    });

    return attachment;
  }

  async getAttachmentUrl(itemId: string, objectName: string, userId: string) {
    const item = await this.itemModel.findById(itemId);
    if (!item || !item.isActive) throw new NotFoundException('Item not found');

    await this.requirePermission(item.organizationId, userId, Permission.VaultRead);

    const exists = item.attachments?.some((a) => a.objectName === objectName);
    if (!exists) throw new NotFoundException('Attachment not found');

    return this.minioService.getFileUrl(objectName);
  }

  async deleteAttachment(
    itemId: string,
    objectName: string,
    userId: string,
  ) {
    const item = await this.itemModel.findById(itemId);
    if (!item || !item.isActive) throw new NotFoundException('Item not found');

    await this.requirePermission(item.organizationId, userId, Permission.VaultDelete);

    await this.minioService.deleteFile(objectName);

    await this.itemModel.findByIdAndUpdate(itemId, {
      $pull: { attachments: { objectName } },
    });

    return { message: 'Attachment deleted' };
  }

  // ─── Permission Check ───────────────────────────

  private async requirePermission(
    orgId: string,
    userId: string,
    permission: Permission,
  ) {
    const membership = await this.memberModel.findOne({
      userId,
      organizationId: orgId,
      isActive: true,
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this organization');
    }

    const rolePerms = ROLE_PERMISSIONS[membership.role] || [];
    const customPerms = membership.customPermissions || [];
    const allPerms = [...rolePerms, ...customPerms];

    if (!allPerms.includes(permission)) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }

    return membership;
  }
}
