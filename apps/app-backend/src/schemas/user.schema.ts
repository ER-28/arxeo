import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { InstanceRole } from '../enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ type: String, default: InstanceRole.User, enum: Object.values(InstanceRole) })
  role: InstanceRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationToken: string;

  @Prop()
  emailVerificationExpires: Date;

  @Prop()
  passwordResetToken: string;

  @Prop()
  passwordResetExpires: Date;

  @Prop()
  lastLoginAt: Date;

  @Prop()
  avatar: string;

  @Prop({ type: [String], default: [] })
  organizationIds: string[];

  @Prop()
  twoFactorSecret: string;

  @Prop({ default: false })
  twoFactorEnabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
