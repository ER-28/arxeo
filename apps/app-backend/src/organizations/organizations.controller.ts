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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrgDto, UpdateOrgDto, InviteMemberDto } from './dto';
import { AuthGuard } from '../auth/guards';
import { OrgRole } from '../enums';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  async create(@Body() dto: CreateOrgDto, @Req() req: any) {
    return this.orgsService.create(dto, req.user.userId);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('orgs:user:')
  @CacheTTL(60)
  @ApiOperation({ summary: 'List organizations for current user' })
  async findAll(@Req() req: any) {
    return this.orgsService.findAllForUser(req.user.userId);
  }

  @Get(':orgId')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('orgs:')
  @CacheTTL(60)
  @ApiOperation({ summary: 'Get organization by ID' })
  async findOne(@Param('orgId') orgId: string, @Req() req: any) {
    return this.orgsService.findById(orgId, req.user.userId);
  }

  @Patch(':orgId')
  @ApiOperation({ summary: 'Update organization' })
  async update(
    @Param('orgId') orgId: string,
    @Body() dto: UpdateOrgDto,
    @Req() req: any,
  ) {
    return this.orgsService.update(orgId, dto, req.user.userId);
  }

  @Delete(':orgId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete organization (owner only)' })
  async delete(@Param('orgId') orgId: string, @Req() req: any) {
    return this.orgsService.delete(orgId, req.user.userId);
  }

  @Post(':orgId/invite')
  @ApiOperation({ summary: 'Invite a member to the organization' })
  async inviteMember(
    @Param('orgId') orgId: string,
    @Body() dto: InviteMemberDto,
    @Req() req: any,
  ) {
    dto.organizationId = orgId;
    return this.orgsService.inviteMember(dto, req.user.userId);
  }

  @Get(':orgId/members')
  @ApiOperation({ summary: 'List organization members' })
  async getMembers(@Param('orgId') orgId: string, @Req() req: any) {
    return this.orgsService.getMembers(orgId, req.user.userId);
  }

  @Patch(':orgId/members/:userId/role')
  @ApiOperation({ summary: 'Update member role (owner only)' })
  async updateMemberRole(
    @Param('orgId') orgId: string,
    @Param('userId') targetUserId: string,
    @Body('role') role: OrgRole,
    @Req() req: any,
  ) {
    return this.orgsService.updateMemberRole(
      orgId,
      targetUserId,
      role,
      req.user.userId,
    );
  }

  @Delete(':orgId/members/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove member from organization' })
  async removeMember(
    @Param('orgId') orgId: string,
    @Param('userId') targetUserId: string,
    @Req() req: any,
  ) {
    return this.orgsService.removeMember(
      orgId,
      targetUserId,
      req.user.userId,
    );
  }

  // ─── Invite Flow ─────────────────────────────────

  @Post(':orgId/invitations')
  @ApiOperation({ summary: 'Create an invitation with token (sends email)' })
  async createInvite(
    @Param('orgId') orgId: string,
    @Body('email') email: string,
    @Body('role') role: string,
    @Req() req: any,
  ) {
    return this.orgsService.createInvite(email, orgId, role, req.user.userId);
  }

  @Post('invitations/:token/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an invitation with token' })
  async acceptInvite(@Param('token') token: string, @Req() req: any) {
    return this.orgsService.acceptInvite(token, req.user.userId);
  }

  @Delete(':orgId/invitations/:inviteId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a pending invitation' })
  async revokeInvite(
    @Param('orgId') orgId: string,
    @Param('inviteId') inviteId: string,
    @Req() req: any,
  ) {
    return this.orgsService.revokeInvite(inviteId, req.user.userId);
  }

  @Get(':orgId/invitations')
  @ApiOperation({ summary: 'List pending invitations' })
  async getPendingInvites(@Param('orgId') orgId: string, @Req() req: any) {
    return this.orgsService.getPendingInvites(orgId, req.user.userId);
  }
}
