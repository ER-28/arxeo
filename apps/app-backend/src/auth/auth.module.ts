import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { TwoFactorModule } from '../two-factor/two-factor.module';
import { AuditModule } from '../audit/audit.module';
import {
  User,
  UserSchema,
  RefreshToken,
  RefreshTokenSchema,
  OrganizationMember,
  OrganizationMemberSchema,
  Vault,
  VaultSchema,
  VaultItem,
  VaultItemSchema,
} from '../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: OrganizationMember.name, schema: OrganizationMemberSchema },
      { name: Vault.name, schema: VaultSchema },
      { name: VaultItem.name, schema: VaultItemSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.expiresIn') || '15m',
        },
      }),
    }),
    TwoFactorModule,
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
