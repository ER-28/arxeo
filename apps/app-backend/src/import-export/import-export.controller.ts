import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { ImportExportService } from './import-export.service';
import { AuthGuard } from '../auth/guards';

@ApiTags('Import/Export')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('vaults/:vaultId')
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Post('import/bitwarden')
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
  @ApiOperation({ summary: 'Import vault items from Bitwarden CSV' })
  async importBitwarden(
    @Param('vaultId') vaultId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const csvContent = file.buffer.toString('utf-8');
    return this.importExportService.importBitwardenCsv(vaultId, csvContent, req.user.userId);
  }

  @Get('export/bitwarden')
  @ApiOperation({ summary: 'Export vault items as Bitwarden CSV' })
  async exportBitwarden(
    @Param('vaultId') vaultId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const csv = await this.importExportService.exportBitwardenCsv(vaultId, req.user.userId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="arxeo-export.csv"`);
    res.send(csv);
  }

  @Get('export/json')
  @ApiOperation({ summary: 'Export vault items as JSON' })
  async exportJson(@Param('vaultId') vaultId: string, @Req() req: any) {
    return this.importExportService.exportJson(vaultId, req.user.userId);
  }
}
