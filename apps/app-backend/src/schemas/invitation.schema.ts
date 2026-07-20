import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InvitationDocument = HydratedDocument<Invitation>;

@Schema({ timestamps: true, collection: 'invitations' })
export class Invitation {
  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, ref: 'Organization' })
  organizationId: string;

  @Prop({ required: true, default: 'member' })
  role: string;

  @Prop({ required: true, ref: 'User' })
  invitedBy: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 'pending', enum: ['pending', 'accepted', 'expired', 'revoked'] })
  status: string;

  @Prop()
  acceptedAt: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
InvitationSchema.index({ email: 1, organizationId: 1 });
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
