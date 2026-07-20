import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VaultItemDocument = HydratedDocument<VaultItem>;

@Schema({ timestamps: true, collection: 'vault_items' })
export class VaultItem {
  @Prop({ required: true, ref: 'Vault' })
  vaultId: string;

  @Prop({ required: true, ref: 'Organization' })
  organizationId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  username: string;

  @Prop()
  password: string;

  @Prop()
  url: string;

  @Prop()
  notes: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 'login', enum: ['login', 'secure-note', 'card', 'identity', 'custom'] })
  type: string;

  @Prop({ type: Map, of: String })
  customFields: Map<string, string>;

  @Prop()
  favicon: string;

  @Prop({ default: false })
  isFavorite: boolean;

  @Prop()
  lastAccessedAt: Date;

  @Prop({ required: true, ref: 'User' })
  createdBy: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: [{
      objectName: { type: String, required: true },
      originalName: { type: String, required: true },
      contentType: { type: String, required: true },
      size: { type: Number, required: true },
      uploadedBy: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    }],
    default: [],
  })
  attachments: {
    objectName: string;
    originalName: string;
    contentType: string;
    size: number;
    uploadedBy: string;
    uploadedAt: Date;
  }[];
}

export const VaultItemSchema = SchemaFactory.createForClass(VaultItem);
VaultItemSchema.index({ vaultId: 1 });
VaultItemSchema.index({ organizationId: 1 });
VaultItemSchema.index({ createdBy: 1 });
