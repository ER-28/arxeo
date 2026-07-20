import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction } from '../schemas/audit-log.schema';

export interface CreateAuditLogDto {
  action: AuditAction;
  userId?: string;
  organizationId?: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<void> {
    try {
      await this.auditModel.create({
        action: dto.action,
        userId: dto.userId,
        organizationId: dto.organizationId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        metadata: dto.metadata,
        ip: dto.ip,
        userAgent: dto.userAgent,
        timestamp: new Date(),
      });
    } catch (err: any) {
      this.logger.error(`Failed to write audit log: ${err.message}`);
    }
  }

  async findByUser(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.auditModel
        .find({ userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.auditModel.countDocuments({ userId }),
    ]);
    return { data, total, page, limit };
  }

  async findByOrg(organizationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.auditModel
        .find({ organizationId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.auditModel.countDocuments({ organizationId }),
    ]);
    return { data, total, page, limit };
  }
}
