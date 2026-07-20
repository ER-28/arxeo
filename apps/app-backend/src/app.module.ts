import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { VaultsModule } from './vaults/vaults.module';
import { MinioModule } from './minio/minio.module';
import { MailModule } from './mail/mail.module';
import { HealthModule } from './health/health.module';
import { TwoFactorModule } from './two-factor/two-factor.module';
import { AuditModule } from './audit/audit.module';
import { ToolsModule } from './tools/tools.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { TeamsModule } from './teams/teams.module';
import { SecurityModule } from './security/security.module';
import { ImportExportModule } from './import-export/import-export.module';
import { SearchModule } from './search/search.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongodb.uri'),
      }),
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.expiresIn') || '15m',
        },
      }),
      global: true,
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get<string>('redis.host'),
        port: config.get<number>('redis.port'),
        password: config.get<string>('redis.password'),
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password'),
        },
      }),
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: config.get<string>('node_env') === 'production' ? 10 : 100,
          },
        ],
      }),
    }),

    ScheduleModule.forRoot(),

    AuthModule,
    UsersModule,
    OrganizationsModule,
    VaultsModule,
    MinioModule,
    MailModule,
    HealthModule,
    TwoFactorModule,
    AuditModule,
    ToolsModule,
    ApiKeysModule,
    TeamsModule,
    SecurityModule,
    ImportExportModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
