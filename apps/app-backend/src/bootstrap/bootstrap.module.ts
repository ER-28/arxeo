import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas';
import { BootstrapService } from './bootstrap.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [BootstrapService],
})
export class BootstrapModule {}
