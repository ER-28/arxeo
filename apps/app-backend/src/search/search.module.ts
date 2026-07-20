import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import {
  VaultItem,
  VaultItemSchema,
  Vault,
  VaultSchema,
  Organization,
  OrganizationSchema,
  OrganizationMember,
  OrganizationMemberSchema,
} from '../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VaultItem.name, schema: VaultItemSchema },
      { name: Vault.name, schema: VaultSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: OrganizationMember.name, schema: OrganizationMemberSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
