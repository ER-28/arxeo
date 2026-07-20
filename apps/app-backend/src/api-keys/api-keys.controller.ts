import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto';
import { AuthGuard } from '../auth/guards';

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  async create(@Req() req: any, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List your API keys' })
  async list(@Req() req: any) {
    return this.apiKeysService.list(req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an API key' })
  async revoke(@Param('id') id: string, @Req() req: any) {
    return this.apiKeysService.revoke(id, req.user.userId);
  }
}
