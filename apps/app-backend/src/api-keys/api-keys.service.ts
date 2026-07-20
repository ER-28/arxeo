import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { ApiKey, ApiKeyDocument } from '../schemas/api-key.schema';
import { CreateApiKeyDto } from './dto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>,
  ) {}

  async create(userId: string, dto: CreateApiKeyDto) {
    const rawKey = `ax_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = await bcrypt.hash(rawKey, 12);
    const keyPrefix = rawKey.substring(0, 7);

    const apiKey = await this.apiKeyModel.create({
      userId,
      name: dto.name,
      keyHash,
      keyPrefix,
      scopes: dto.scopes || [],
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    return {
      id: apiKey._id,
      name: apiKey.name,
      key: rawKey,
      keyPrefix,
      scopes: apiKey.scopes,
      expiresAt: apiKey.expiresAt,
      message: 'Store this key securely - it will not be shown again',
    };
  }

  async list(userId: string) {
    return this.apiKeyModel
      .find({ userId })
      .select('-keyHash')
      .sort({ createdAt: -1 });
  }

  async revoke(apiKeyId: string, userId: string) {
    const key = await this.apiKeyModel.findOne({ _id: apiKeyId, userId });
    if (!key) throw new NotFoundException('API key not found');

    key.isActive = false;
    await key.save();

    return { message: 'API key revoked' };
  }

  async validateKey(rawKey: string) {
    if (!rawKey.startsWith('ax_')) return null;

    const keys = await this.apiKeyModel.find({ isActive: true });

    for (const key of keys) {
      const matches = await bcrypt.compare(rawKey, key.keyHash);
      if (matches) {
        if (key.expiresAt && key.expiresAt < new Date()) return null;

        key.lastUsedAt = new Date();
        await key.save();

        return { userId: key.userId, scopes: key.scopes };
      }
    }

    return null;
  }
}
