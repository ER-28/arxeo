import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema({ timestamps: true, collection: 'organizations' })
export class Organization {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ unique: true, trim: true, lowercase: true })
  slug: string;

  @Prop()
  description: string;

  @Prop()
  logo: string;

  @Prop({ default: 'free', enum: ['free', 'standard', 'pro', 'enterprise'] })
  plan: string;

  @Prop({ default: 10 })
  maxMembers: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  ownerId: string;

  @Prop({
    type: {
      ssoEnabled: { type: Boolean, default: false },
      ssoProvider: String,
      ssoConfig: { type: Map, of: String },
    },
    _id: false,
    default: {},
  })
  settings: {
    ssoEnabled: boolean;
    ssoProvider?: string;
    ssoConfig?: Map<string, string>;
  };

  @Prop({ default: 0 })
  vaultCount: number;

  @Prop()
  inviteExpires: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
