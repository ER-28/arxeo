import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TeamDocument = HydratedDocument<Team>;

@Schema({ timestamps: true, collection: 'teams' })
export class Team {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, ref: 'Organization' })
  organizationId: string;

  @Prop({ type: [String], default: [] })
  memberIds: string[];

  @Prop({ required: true, ref: 'User' })
  createdBy: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
TeamSchema.index({ organizationId: 1 });
