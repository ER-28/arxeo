import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import slugify from 'slugify';
import {
  Organization,
  OrganizationDocument,
  OrganizationMember,
  OrganizationMemberDocument,
  User,
  UserDocument,
  Invitation,
  InvitationDocument,
} from '../schemas';
import { OrgRole, Permission, ROLE_PERMISSIONS } from '../enums';
import { CreateOrgDto, UpdateOrgDto, InviteMemberDto } from './dto';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectModel(Organization.name)
    private orgModel: Model<OrganizationDocument>,
    @InjectModel(OrganizationMember.name)
    private memberModel: Model<OrganizationMemberDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Invitation.name)
    private invitationModel: Model<InvitationDocument>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateOrgDto, userId: string) {
    const slug = slugify(dto.name, { lower: true, strict: true });

    const existing = await this.orgModel.findOne({ slug });
    if (existing) {
      throw new ConflictException('Organization with this name already exists');
    }

    const user = await this.userModel.findById(userId);

    const org = await this.orgModel.create({
      name: dto.name,
      slug,
      description: dto.description,
      ownerId: userId,
      plan: dto.plan || 'free',
    });

    // Add owner as member
    await this.memberModel.create({
      userId,
      organizationId: org._id.toString(),
      role: OrgRole.Owner,
      joinedAt: new Date(),
    });

    // Add org to user's organizationIds
    await this.userModel.findByIdAndUpdate(userId, {
      $push: { organizationIds: org._id.toString() },
    });

    return org;
  }

  async findAllForUser(userId: string) {
    const memberships = await this.memberModel.find({
      userId,
      isActive: true,
    });

    const orgIds = memberships.map((m) => m.organizationId);

    const orgs = await this.orgModel.find({ _id: { $in: orgIds } });

    return orgs.map((org) => {
      const membership = memberships.find(
        (m) => m.organizationId === org._id.toString(),
      );
      return {
        ...org.toObject(),
        myRole: membership?.role,
      };
    });
  }

  async findById(orgId: string, userId: string) {
    const org = await this.orgModel.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found');

    const membership = await this.memberModel.findOne({
      userId,
      organizationId: orgId,
      isActive: true,
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this organization');
    }

    return { ...org.toObject(), myRole: membership.role };
  }

  async update(orgId: string, dto: UpdateOrgDto, userId: string) {
    await this.requireRole(orgId, userId, [OrgRole.Owner, OrgRole.Admin]);

    const org = await this.orgModel.findByIdAndUpdate(orgId, dto, {
      new: true,
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async delete(orgId: string, userId: string) {
    await this.requireRole(orgId, userId, [OrgRole.Owner]);

    await this.memberModel.deleteMany({ organizationId: orgId });
    await this.orgModel.findByIdAndDelete(orgId);

    // Remove from user's organizationIds
    await this.userModel.updateMany(
      { organizationIds: orgId },
      { $pull: { organizationIds: orgId } },
    );

    return { message: 'Organization deleted' };
  }

  async inviteMember(dto: InviteMemberDto, invitedBy: string) {
    const membership = await this.requireRole(
      dto.organizationId,
      invitedBy,
      [OrgRole.Owner, OrgRole.Admin],
    );

    // Check org member limit
    const org = await this.orgModel.findById(dto.organizationId);
    if (!org) throw new NotFoundException('Organization not found');

    const memberCount = await this.memberModel.countDocuments({
      organizationId: dto.organizationId,
      isActive: true,
    });

    if (memberCount >= org.maxMembers) {
      throw new BadRequestException(
        `Organization has reached its maximum of ${org.maxMembers} members`,
      );
    }

    // Check if user exists
    const invitee = await this.userModel.findOne({ email: dto.email });
    if (!invitee) {
      throw new BadRequestException(
        'User not found. They must register first.',
      );
    }

    // Check if already a member
    const existingMember = await this.memberModel.findOne({
      userId: invitee._id.toString(),
      organizationId: dto.organizationId,
    });

    if (existingMember) {
      if (existingMember.isActive) {
        throw new ConflictException('User is already a member');
      }
      // Reactivate
      existingMember.isActive = true;
      existingMember.role = dto.role || OrgRole.Member;
      await existingMember.save();
      return existingMember;
    }

    const member = await this.memberModel.create({
      userId: invitee._id.toString(),
      organizationId: dto.organizationId,
      role: dto.role || OrgRole.Member,
      invitedBy,
      joinedAt: new Date(),
    });

    // Add org to user's organizationIds
    await this.userModel.findByIdAndUpdate(invitee._id, {
      $push: { organizationIds: dto.organizationId },
    });

    // Send invite email
    const inviter = await this.userModel.findById(invitedBy);
    this.mailService
      .sendInvite(invitee.email, inviter?.username || 'Someone', org.name)
      .catch((err) => this.logger.warn(`Failed to send invite email: ${err.message}`));

    return member;
  }

  async getMembers(orgId: string, userId: string) {
    await this.requireRole(orgId, userId, [
      OrgRole.Owner,
      OrgRole.Admin,
      OrgRole.Member,
      OrgRole.Viewer,
    ]);

    const members = await this.memberModel.find({
      organizationId: orgId,
      isActive: true,
    });

    const userIds = members.map((m) => m.userId);
    const users = await this.userModel
      .find({ _id: { $in: userIds } })
      .select('-password');

    return members.map((m) => {
      const user = users.find((u) => u._id.toString() === m.userId);
      return {
        ...m.toObject(),
        user: user
          ? {
              id: user._id,
              email: user.email,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              avatar: user.avatar,
            }
          : null,
      };
    });
  }

  async updateMemberRole(
    orgId: string,
    targetUserId: string,
    role: OrgRole,
    requestedBy: string,
  ) {
    await this.requireRole(orgId, requestedBy, [OrgRole.Owner]);

    const membership = await this.memberModel.findOne({
      userId: targetUserId,
      organizationId: orgId,
    });

    if (!membership) throw new NotFoundException('Member not found');
    if (membership.role === OrgRole.Owner) {
      throw new ForbiddenException('Cannot change the owner role');
    }

    membership.role = role;
    await membership.save();
    return membership;
  }

  async removeMember(orgId: string, targetUserId: string, requestedBy: string) {
    await this.requireRole(orgId, requestedBy, [
      OrgRole.Owner,
      OrgRole.Admin,
    ]);

    const membership = await this.memberModel.findOne({
      userId: targetUserId,
      organizationId: orgId,
    });

    if (!membership) throw new NotFoundException('Member not found');
    if (membership.role === OrgRole.Owner) {
      throw new ForbiddenException('Cannot remove the owner');
    }
    if (targetUserId === requestedBy) {
      throw new ForbiddenException('Cannot remove yourself');
    }

    membership.isActive = false;
    await membership.save();

    await this.userModel.findByIdAndUpdate(targetUserId, {
      $pull: { organizationIds: orgId },
    });

    return { message: 'Member removed' };
  }

  // ─── Invite Flow ─────────────────────────────────

  async createInvite(email: string, orgId: string, role: string, invitedBy: string) {
    await this.requireRole(orgId, invitedBy, [OrgRole.Owner, OrgRole.Admin]);

    const org = await this.orgModel.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found');

    // Check for existing pending invite
    const existingInvite = await this.invitationModel.findOne({
      email,
      organizationId: orgId,
      status: 'pending',
    });
    if (existingInvite) throw new ConflictException('Invitation already pending');

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await this.invitationModel.create({
      email,
      organizationId: orgId,
      role: role || 'member',
      invitedBy,
      token,
      expiresAt,
    });

    this.mailService
      .sendInvite(email, invitedBy, org.name)
      .catch((err) => this.logger.warn(`Failed to send invite: ${err.message}`));

    return { invitationId: invitation._id, token, expiresAt };
  }

  async acceptInvite(token: string, userId: string) {
    const invitation = await this.invitationModel.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) throw new BadRequestException('Invalid or expired invitation');

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException('This invitation is for a different email');
    }

    // Check if already a member
    const existingMember = await this.memberModel.findOne({
      userId,
      organizationId: invitation.organizationId,
    });

    if (existingMember && existingMember.isActive) {
      invitation.status = 'accepted';
      invitation.acceptedAt = new Date();
      await invitation.save();
      throw new ConflictException('Already a member of this organization');
    }

    if (existingMember) {
      existingMember.isActive = true;
      existingMember.role = invitation.role as OrgRole;
      await existingMember.save();
    } else {
      await this.memberModel.create({
        userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
        joinedAt: new Date(),
      });
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { organizationIds: invitation.organizationId },
    });

    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    return { message: 'Invitation accepted', organizationId: invitation.organizationId };
  }

  async revokeInvite(inviteId: string, userId: string) {
    const invitation = await this.invitationModel.findById(inviteId);
    if (!invitation) throw new NotFoundException('Invitation not found');

    await this.requireRole(invitation.organizationId, userId, [OrgRole.Owner, OrgRole.Admin]);

    invitation.status = 'revoked';
    await invitation.save();

    return { message: 'Invitation revoked' };
  }

  async getPendingInvites(orgId: string, userId: string) {
    await this.requireRole(orgId, userId, [OrgRole.Owner, OrgRole.Admin]);

    return this.invitationModel.find({
      organizationId: orgId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });
  }

  private async requireRole(
    orgId: string,
    userId: string,
    allowedRoles: OrgRole[],
  ) {
    const membership = await this.memberModel.findOne({
      userId,
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
      ...allowedRoles.map((r) => roleHierarchy[r] || 0),
    );

    if (userLevel < minRequired) {
      throw new ForbiddenException('Insufficient organization role');
    }

    return membership;
  }
}
