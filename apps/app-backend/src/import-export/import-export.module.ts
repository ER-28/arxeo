import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImportExportService } from './import-export.service';
import { ImportExportController } from './import-export.controller';
import { Vault, VaultSchema, VaultItem, VaultItemSchema } from '../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vault.name, schema: VaultSchema },
      { name: VaultItem.name, schema: VaultItemSchema },
    ]),
  ],
  controllers: [ImportExportController],
  providers: [ImportExportService],
  exports: [ImportExportService],
})
export class ImportExportModule {}
