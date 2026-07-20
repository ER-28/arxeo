import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VaultsService } from './vaults.service';
import { VaultsController } from './vaults.controller';
import {
  Vault,
  VaultSchema,
  VaultItem,
  VaultItemSchema,
  OrganizationMember,
  OrganizationMemberSchema,
  VaultItemVersion,
  VaultItemVersionSchema,
} from '../schemas';
import { MinioModule } from '../minio/minio.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vault.name, schema: VaultSchema },
      { name: VaultItem.name, schema: VaultItemSchema },
      { name: OrganizationMember.name, schema: OrganizationMemberSchema },
      { name: VaultItemVersion.name, schema: VaultItemVersionSchema },
    ]),
    MinioModule,
    AuditModule,
  ],
  controllers: [VaultsController],
  providers: [VaultsService],
  exports: [VaultsService],
})
export class VaultsModule {}
