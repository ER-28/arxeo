import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument, OrganizationMember, OrganizationMemberDocument } from '../schemas';
import { OrgRole } from '../enums';
import { CreateTeamDto, UpdateTeamDto } from './dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(OrganizationMember.name)
    private memberModel: Model<OrganizationMemberDocument>,
  ) {}

  async create(orgId: string, dto: CreateTeamDto, userId: string) {
    await this.requireRole(orgId, userId, [OrgRole.Owner, OrgRole.Admin]);

    const team = await this.teamModel.create({
      name: dto.name,
      description: dto.description,
      organizationId: orgId,
      memberIds: dto.memberIds || [],
      createdBy: userId,
    });

    return team;
  }

  async list(orgId: string, userId: string) {
    await this.requireRole(orgId, userId, [OrgRole.Owner, OrgRole.Admin, OrgRole.Member]);
    return this.teamModel.find({ organizationId: orgId, isActive: true });
  }

  async getById(teamId: string, userId: string) {
    const team = await this.teamModel.findById(teamId);
    if (!team || !team.isActive) throw new NotFoundException('Team not found');

    await this.requireRole(team.organizationId, userId, [OrgRole.Owner, OrgRole.Admin, OrgRole.Member]);
    return team;
  }

  async update(teamId: string, dto: UpdateTeamDto, userId: string) {
    const team = await this.teamModel.findById(teamId);
    if (!team) throw new NotFoundException('Team not found');

    await this.requireRole(team.organizationId, userId, [OrgRole.Owner, OrgRole.Admin]);

    const updated = await this.teamModel.findByIdAndUpdate(teamId, dto, { new: true });
    return updated;
  }

  async delete(teamId: string, userId: string) {
    const team = await this.teamModel.findById(teamId);
    if (!team) throw new NotFoundException('Team not found');

    await this.requireRole(team.organizationId, userId, [OrgRole.Owner, OrgRole.Admin]);

    team.isActive = false;
    await team.save();
    return { message: 'Team deleted' };
  }

  async addMembers(teamId: string, userIds: string[], requestedBy: string) {
    const team = await this.teamModel.findById(teamId);
    if (!team) throw new NotFoundException('Team not found');

    await this.requireRole(team.organizationId, requestedBy, [OrgRole.Owner, OrgRole.Admin]);

    const newMembers = [...new Set([...team.memberIds, ...userIds])];
    team.memberIds = newMembers;
    await team.save();

    return { memberIds: team.memberIds };
  }

  async removeMembers(teamId: string, userIds: string[], requestedBy: string) {
    const team = await this.teamModel.findById(teamId);
    if (!team) throw new NotFoundException('Team not found');

    await this.requireRole(team.organizationId, requestedBy, [OrgRole.Owner, OrgRole.Admin]);

    team.memberIds = team.memberIds.filter((id) => !userIds.includes(id));
    await team.save();

    return { memberIds: team.memberIds };
  }

  private async requireRole(orgId: string, userId: string, allowedRoles: OrgRole[]) {
    const membership = await this.memberModel.findOne({
      userId,
      organizationId: orgId,
      isActive: true,
    });
    if (!membership) throw new ForbiddenException('Not a member');

    const roleHierarchy: Record<OrgRole, number> = {
      [OrgRole.Owner]: 4,
      [OrgRole.Admin]: 3,
      [OrgRole.Member]: 2,
      [OrgRole.Viewer]: 1,
    };

    const userLevel = roleHierarchy[membership.role] || 0;
    const minRequired = Math.min(...allowedRoles.map((r) => roleHierarchy[r] || 0));

    if (userLevel < minRequired) throw new ForbiddenException('Insufficient role');
    return membership;
  }
}
