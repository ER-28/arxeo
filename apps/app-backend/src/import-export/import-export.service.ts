import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vault, VaultDocument, VaultItem, VaultItemDocument } from '../schemas';

export interface ImportEntry {
  name?: string;
  login_uri?: string;
  login_username?: string;
  login_password?: string;
  notes?: string;
  totp?: string;
  folder?: string;
  type?: string;
}

@Injectable()
export class ImportExportService {
  private readonly logger = new Logger(ImportExportService.name);

  constructor(
    @InjectModel(Vault.name) private vaultModel: Model<VaultDocument>,
    @InjectModel(VaultItem.name) private itemModel: Model<VaultItemDocument>,
  ) {}

  async importBitwardenCsv(
    vaultId: string,
    csvContent: string,
    userId: string,
  ): Promise<{ imported: number; errors: string[] }> {
    const vault = await this.vaultModel.findById(vaultId);
    if (!vault) throw new BadRequestException('Vault not found');

    const lines = csvContent.split('\n').filter((l) => l.trim());
    if (lines.length < 2) throw new BadRequestException('CSV file is empty or has no data rows');

    const errors: string[] = [];
    let imported = 0;

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      try {
        const fields = this.parseCSVLine(lines[i]);
        const name = fields[0] || `Imported item ${i}`;
        const uri = fields[1] || '';
        const username = fields[2] || '';
        const password = fields[3] || '';
        const notes = fields[4] || '';
        const totp = fields[5] || '';

        await this.itemModel.create({
          vaultId,
          organizationId: vault.organizationId,
          title: name,
          username,
          password,
          url: uri,
          notes,
          type: 'login',
          createdBy: userId,
        });

        imported++;
      } catch (err: any) {
        errors.push(`Row ${i}: ${err.message}`);
      }
    }

    await this.vaultModel.findByIdAndUpdate(vaultId, {
      $inc: { itemCount: imported },
    });

    return { imported, errors };
  }

  async exportBitwardenCsv(vaultId: string, userId: string): Promise<string> {
    const items = await this.itemModel.find({ vaultId, isActive: true }).lean();

    const header = 'name,login_uri,login_username,login_password,notes,totp';
    const rows = items.map((item) =>
      [
        this.escapeCSV(item.title),
        this.escapeCSV(item.url || ''),
        this.escapeCSV(item.username || ''),
        this.escapeCSV(item.password || ''),
        this.escapeCSV(item.notes || ''),
        this.escapeCSV(''),
      ].join(','),
    );

    return [header, ...rows].join('\n');
  }

  async exportJson(vaultId: string, userId: string) {
    const vault = await this.vaultModel.findById(vaultId).lean();
    const items = await this.itemModel.find({ vaultId, isActive: true }).lean();

    return {
      vault: { name: vault?.name, description: vault?.description },
      items: items.map((item) => ({
        title: item.title,
        username: item.username,
        password: item.password,
        url: item.url,
        notes: item.notes,
        type: item.type,
        tags: item.tags,
        createdAt: (item as any).createdAt,
        updatedAt: (item as any).updatedAt,
      })),
      exportedAt: new Date().toISOString(),
    };
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
