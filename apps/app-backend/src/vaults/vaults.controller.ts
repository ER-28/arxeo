import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { VaultsService } from './vaults.service';
import { CreateVaultDto, UpdateVaultDto, CreateVaultItemDto, UpdateVaultItemDto, ShareVaultDto } from './dto';
import { AuthGuard } from '../auth/guards';

@ApiTags('Vaults')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class VaultsController {
  constructor(private readonly vaultsService: VaultsService) {}

  // ─── Vaults ─────────────────────────────────────

  @Post('organizations/:orgId/vaults')
  @ApiOperation({ summary: 'Create a vault in an organization' })
  async createVault(
    @Param('orgId') orgId: string,
    @Body() dto: CreateVaultDto,
    @Req() req: any,
  ) {
    dto.organizationId = orgId;
    return this.vaultsService.createVault(dto, req.user.userId);
  }

  @Get('organizations/:orgId/vaults')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('vaults:org:')
  @CacheTTL(30)
  @ApiOperation({ summary: 'List vaults in an organization' })
  async getVaults(@Param('orgId') orgId: string, @Req() req: any) {
    return this.vaultsService.getVaults(orgId, req.user.userId);
  }

  @Get('vaults/:vaultId')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('vaults:')
  @CacheTTL(30)
  @ApiOperation({ summary: 'Get a vault by ID' })
  async getVault(@Param('vaultId') vaultId: string, @Req() req: any) {
    return this.vaultsService.getVault(vaultId, req.user.userId);
  }

  @Patch('vaults/:vaultId')
  @ApiOperation({ summary: 'Update a vault' })
  async updateVault(
    @Param('vaultId') vaultId: string,
    @Body() dto: UpdateVaultDto,
    @Req() req: any,
  ) {
    return this.vaultsService.updateVault(vaultId, dto, req.user.userId);
  }

  @Delete('vaults/:vaultId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a vault' })
  async deleteVault(@Param('vaultId') vaultId: string, @Req() req: any) {
    return this.vaultsService.deleteVault(vaultId, req.user.userId);
  }

  // ─── Vault Items ────────────────────────────────

  @Post('vaults/:vaultId/items')
  @ApiOperation({ summary: 'Create a vault item' })
  async createItem(
    @Param('vaultId') vaultId: string,
    @Body() dto: CreateVaultItemDto,
    @Req() req: any,
  ) {
    return this.vaultsService.createItem(vaultId, dto, req.user.userId);
  }

  @Get('vaults/:vaultId/items')
  @ApiOperation({ summary: 'List items in a vault' })
  async getItems(
    @Param('vaultId') vaultId: string,
    @Query('search') search: string,
    @Req() req: any,
  ) {
    return this.vaultsService.getItems(vaultId, req.user.userId, search);
  }

  @Get('items/:itemId')
  @ApiOperation({ summary: 'Get a vault item by ID' })
  async getItem(@Param('itemId') itemId: string, @Req() req: any) {
    return this.vaultsService.getItem(itemId, req.user.userId);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update a vault item' })
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateVaultItemDto,
    @Req() req: any,
  ) {
    return this.vaultsService.updateItem(itemId, dto, req.user.userId);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a vault item' })
  async deleteItem(@Param('itemId') itemId: string, @Req() req: any) {
    return this.vaultsService.deleteItem(itemId, req.user.userId);
  }

  @Get('items/:itemId/history')
  @ApiOperation({ summary: 'Get version history of a vault item' })
  async getItemHistory(@Param('itemId') itemId: string, @Req() req: any) {
    return this.vaultsService.getItemHistory(itemId, req.user.userId);
  }

  // ─── Vault Sharing ──────────────────────────────

  @Post('vaults/:vaultId/share')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Share a vault with users' })
  async shareVault(
    @Param('vaultId') vaultId: string,
    @Body() dto: ShareVaultDto,
    @Req() req: any,
  ) {
    return this.vaultsService.shareVault(vaultId, dto.userIds, req.user.userId);
  }

  @Post('vaults/:vaultId/unshare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove user access from a vault' })
  async unshareVault(
    @Param('vaultId') vaultId: string,
    @Body() dto: ShareVaultDto,
    @Req() req: any,
  ) {
    return this.vaultsService.unshareVault(vaultId, dto.userIds, req.user.userId);
  }

  @Get('vaults/:vaultId/sharees')
  @ApiOperation({ summary: 'List users a vault is shared with' })
  async getVaultSharees(@Param('vaultId') vaultId: string, @Req() req: any) {
    return this.vaultsService.getVaultSharees(vaultId, req.user.userId);
  }

  // ─── Attachments ─────────────────────────────────

  @Post('items/:itemId/attachments')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload an attachment to a vault item' })
  async uploadAttachment(
    @Param('itemId') itemId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.vaultsService.addAttachment(itemId, file, req.user.userId);
  }

  @Get('items/:itemId/attachments/:objectName')
  @ApiOperation({ summary: 'Get a presigned download URL for an attachment' })
  async getAttachmentUrl(
    @Param('itemId') itemId: string,
    @Param('objectName') objectName: string,
    @Req() req: any,
  ) {
    const decodedObjectName = decodeURIComponent(objectName);
    return this.vaultsService.getAttachmentUrl(itemId, decodedObjectName, req.user.userId);
  }

  @Delete('items/:itemId/attachments/:objectName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an attachment' })
  async deleteAttachment(
    @Param('itemId') itemId: string,
    @Param('objectName') objectName: string,
    @Req() req: any,
  ) {
    const decodedObjectName = decodeURIComponent(objectName);
    return this.vaultsService.deleteAttachment(itemId, decodedObjectName, req.user.userId);
  }
}
