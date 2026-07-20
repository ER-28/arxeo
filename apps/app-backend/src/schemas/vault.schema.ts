import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VaultDocument = HydratedDocument<Vault>;

@Schema({ timestamps: true, collection: 'vaults' })
export class Vault {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, ref: 'Organization' })
  organizationId: string;

  @Prop({ required: true, ref: 'User' })
  createdBy: string;

  @Prop()
  encryptionKey: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isShared: boolean;

  @Prop({ type: [String], default: [] })
  sharedWithUserIds: string[];

  @Prop({ default: 0 })
  itemCount: number;

  @Prop({ type: Map, of: String })
  metadata: Map<string, string>;
}

export const VaultSchema = SchemaFactory.createForClass(Vault);
VaultSchema.index({ organizationId: 1 });
VaultSchema.index({ createdBy: 1 });
