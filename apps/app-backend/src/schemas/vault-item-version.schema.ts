import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VaultItemVersionDocument = HydratedDocument<VaultItemVersion>;

@Schema({ timestamps: false, collection: 'vault_item_versions' })
export class VaultItemVersion {
  @Prop({ required: true, ref: 'VaultItem' })
  itemId: string;

  @Prop({ required: true, ref: 'Organization' })
  organizationId: string;

  @Prop({ required: true })
  version: number;

  @Prop({ required: true })
  snapshot: Record<string, any>;

  @Prop({ required: true, ref: 'User' })
  changedBy: string;

  @Prop({ default: Date.now })
  changedAt: Date;
}

export const VaultItemVersionSchema = SchemaFactory.createForClass(VaultItemVersion);
VaultItemVersionSchema.index({ itemId: 1, version: -1 });
VaultItemVersionSchema.index({ itemId: 1, changedAt: -1 });
