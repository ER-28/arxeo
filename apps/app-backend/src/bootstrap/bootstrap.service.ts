import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas';
import { InstanceRole } from '../enums';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');
    const adminUsername = this.config.get<string>('ADMIN_USERNAME');
    const adminPassword = this.config.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminUsername || !adminPassword) {
      this.logger.log('No ADMIN_EMAIL/ADMIN_USERNAME/ADMIN_PASSWORD set — skipping admin seed');
      return;
    }

    const existing = await this.userModel.findOne({
      $or: [{ email: adminEmail }, { username: adminUsername }],
    });

    if (existing) {
      this.logger.log(`Admin user already exists (${existing.email}) — skipping seed`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await this.userModel.create({
      email: adminEmail,
      username: adminUsername,
      password: hashedPassword,
      firstName: this.config.get<string>('ADMIN_FIRST_NAME') || 'Admin',
      lastName: this.config.get<string>('ADMIN_LAST_NAME') || 'User',
      role: InstanceRole.SuperAdmin,
      isActive: true,
      isEmailVerified: true,
    });

    this.logger.log(`Admin user created: ${admin.email} (role: ${admin.role})`);
  }
}
