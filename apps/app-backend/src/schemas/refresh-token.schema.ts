import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ timestamps: true, collection: 'refresh_tokens', expires: 30 * 24 * 60 * 60 })
export class RefreshToken {
  @Prop({ required: true, ref: 'User' })
  userId: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop()
  expiresAt: Date;

  @Prop()
  ip: string;

  @Prop()
  userAgent: string;

  @Prop({ default: true })
  isRevoked: boolean;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
RefreshTokenSchema.index({ userId: 1 });
