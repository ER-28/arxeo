import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { AuthGuard } from '../auth/guards';

@ApiTags('Security')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('check-breach')
  @ApiOperation({ summary: 'Check if a password has been breached (HIBP k-anonymity)' })
  async checkBreach(@Body('password') password: string) {
    return this.securityService.checkPasswordBreach(password);
  }
}
