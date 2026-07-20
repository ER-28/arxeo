import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, TeamMembersDto } from './dto';
import { AuthGuard } from '../auth/guards';

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('organizations/:orgId/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a team' })
  async create(
    @Param('orgId') orgId: string,
    @Body() dto: CreateTeamDto,
    @Req() req: any,
  ) {
    return this.teamsService.create(orgId, dto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List teams' })
  async list(@Param('orgId') orgId: string, @Req() req: any) {
    return this.teamsService.list(orgId, req.user.userId);
  }

  @Get(':teamId')
  @ApiOperation({ summary: 'Get a team' })
  async getById(@Param('teamId') teamId: string, @Req() req: any) {
    return this.teamsService.getById(teamId, req.user.userId);
  }

  @Patch(':teamId')
  @ApiOperation({ summary: 'Update a team' })
  async update(
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto,
    @Req() req: any,
  ) {
    return this.teamsService.update(teamId, dto, req.user.userId);
  }

  @Delete(':teamId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a team' })
  async delete(@Param('teamId') teamId: string, @Req() req: any) {
    return this.teamsService.delete(teamId, req.user.userId);
  }

  @Post(':teamId/members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add members to team' })
  async addMembers(
    @Param('teamId') teamId: string,
    @Body() dto: TeamMembersDto,
    @Req() req: any,
  ) {
    return this.teamsService.addMembers(teamId, dto.userIds, req.user.userId);
  }

  @Delete(':teamId/members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove members from team' })
  async removeMembers(
    @Param('teamId') teamId: string,
    @Body() dto: TeamMembersDto,
    @Req() req: any,
  ) {
    return this.teamsService.removeMembers(teamId, dto.userIds, req.user.userId);
  }
}
