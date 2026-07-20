import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrgRole } from '../enums';

export type OrganizationMemberDocument = HydratedDocument<OrganizationMember>;

@Schema({ timestamps: true, collection: 'organization_members' })
export class OrganizationMember {
  @Prop({ required: true, ref: 'User' })
  userId: string;

  @Prop({ required: true, ref: 'Organization' })
  organizationId: string;

  @Prop({ type: String, required: true, enum: Object.values(OrgRole) })
  role: OrgRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  invitedBy: string;

  @Prop()
  joinedAt: Date;

  @Prop()
  customPermissions: string[];
}

export const OrganizationMemberSchema =
  SchemaFactory.createForClass(OrganizationMember);
OrganizationMemberSchema.index({ userId: 1, organizationId: 1 }, { unique: true });
OrganizationMemberSchema.index({ organizationId: 1 });
OrganizationMemberSchema.index({ userId: 1 });
