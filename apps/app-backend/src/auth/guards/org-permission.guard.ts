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
import { Permission, ROLE_PERMISSIONS, OrgRole } from '../../enums';
import { PERMISSIONS_KEY } from '../decorators/org-permissions.decorator';

@Injectable()
export class OrgPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(OrganizationMember.name)
    private memberModel: Model<OrganizationMemberDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

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

    const rolePerms = ROLE_PERMISSIONS[membership.role] || [];
    const customPerms = membership.customPermissions || [];
    const allPerms = [...rolePerms, ...customPerms];

    const hasAll = requiredPermissions.every((perm) => allPerms.includes(perm));

    if (!hasAll) {
      throw new ForbiddenException('Insufficient organization permissions');
    }

    request.orgMembership = {
      organizationId: orgId,
      role: membership.role,
      membershipId: membership._id.toString(),
    };

    return true;
  }
}
