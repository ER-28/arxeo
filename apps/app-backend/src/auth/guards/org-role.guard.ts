import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrganizationMember, OrganizationMemberDocument } from '../../schemas';
import { OrgRole } from '../../enums';
import { ORG_ROLE_KEY } from '../decorators/org-role.decorator';

@Injectable()
export class OrgRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(OrganizationMember.name)
    private memberModel: Model<OrganizationMemberDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<OrgRole[]>(
      ORG_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgId =
      request.params.orgId || request.body.organizationId || request.query.orgId;

    if (!orgId) {
      throw new ForbiddenException('Organization ID required');
    }

    const membership = await this.memberModel.findOne({
      userId: user.userId,
      organizationId: orgId,
      isActive: true,
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this organization');
    }

    const roleHierarchy: Record<OrgRole, number> = {
      [OrgRole.Owner]: 4,
      [OrgRole.Admin]: 3,
      [OrgRole.Member]: 2,
      [OrgRole.Viewer]: 1,
    };

    const userLevel = roleHierarchy[membership.role] || 0;
    const minRequired = Math.min(
      ...requiredRoles.map((r) => roleHierarchy[r] || 0),
    );

    if (userLevel < minRequired) {
      throw new ForbiddenException('Insufficient organization role');
    }

    request.orgMembership = {
      organizationId: orgId,
      role: membership.role,
      membershipId: membership._id.toString(),
    };

    return true;
  }
}
