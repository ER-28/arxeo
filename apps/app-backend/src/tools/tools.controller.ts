import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ToolsService, GeneratePasswordDto } from './tools.service';

@ApiTags('Tools')
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post('generate-password')
  @ApiOperation({ summary: 'Generate a random password' })
  async generatePassword(@Body() dto: GeneratePasswordDto) {
    return this.toolsService.generatePassword(dto);
  }
}
