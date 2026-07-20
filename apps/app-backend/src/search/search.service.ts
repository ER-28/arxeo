import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  VaultItem, VaultItemDocument,
  Vault, VaultDocument,
  Organization, OrganizationDocument,
} from '../schemas';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectModel(VaultItem.name) private itemModel: Model<VaultItemDocument>,
    @InjectModel(Vault.name) private vaultModel: Model<VaultDocument>,
    @InjectModel(Organization.name) private orgModel: Model<OrganizationDocument>,
  ) {}

  async globalSearch(userId: string, query: string) {
    const regex = new RegExp(query, 'i');

    const [items, vaults, orgs] = await Promise.all([
      this.itemModel
        .find({
          isActive: true,
          $or: [
            { title: regex },
            { username: regex },
            { url: regex },
            { notes: regex },
            { tags: regex },
          ],
        })
        .limit(20)
        .lean(),
      this.vaultModel
        .find({
          isActive: true,
          $or: [{ name: regex }, { description: regex }],
        })
        .limit(10)
        .lean(),
      this.orgModel
        .find({
          $or: [{ name: regex }, { description: regex }],
        })
        .limit(10)
        .lean(),
    ]);

    return {
      vaultItems: items.map((i) => ({ type: 'vaultItem', ...i })),
      vaults: vaults.map((v) => ({ type: 'vault', ...v })),
      organizations: orgs.map((o) => ({ type: 'organization', ...o })),
      total: items.length + vaults.length + orgs.length,
    };
  }

  async searchItems(vaultId: string, query: string, userId: string) {
    const regex = new RegExp(query, 'i');

    return this.itemModel
      .find({
        vaultId,
        isActive: true,
        $or: [
          { title: regex },
          { username: regex },
          { url: regex },
          { notes: regex },
          { tags: regex },
        ],
      })
      .sort({ isFavorite: -1, title: 1 })
      .limit(50)
      .lean();
  }
}
