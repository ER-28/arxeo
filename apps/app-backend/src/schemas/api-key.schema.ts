import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ApiKeyDocument = HydratedDocument<ApiKey>;

@Schema({ timestamps: true, collection: 'api_keys' })
export class ApiKey {
  @Prop({ required: true, ref: 'User' })
  userId: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true })
  keyHash: string;

  @Prop({ required: true })
  keyPrefix: string;

  @Prop({ type: [String], default: [] })
  scopes: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastUsedAt: Date;

  @Prop()
  expiresAt: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
ApiKeySchema.index({ userId: 1 });
