import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorService } from './two-factor.service';
import { VerifyTwoFactorDto } from './dto';
import { AuthGuard } from '../auth/guards';

@ApiTags('2FA')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('2fa')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('setup')
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  async setup(@Req() req: any) {
    return this.twoFactorService.setup(req.user.userId);
  }

  @Post('enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable 2FA with verification code' })
  async enable(@Req() req: any, @Body() dto: VerifyTwoFactorDto) {
    return this.twoFactorService.enable(req.user.userId, dto.code);
  }

  @Post('disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA with verification code' })
  async disable(@Req() req: any, @Body() dto: VerifyTwoFactorDto) {
    return this.twoFactorService.disable(req.user.userId, dto.code);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get 2FA status' })
  async getStatus(@Req() req: any) {
    return this.twoFactorService.getStatus(req.user.userId);
  }
}
