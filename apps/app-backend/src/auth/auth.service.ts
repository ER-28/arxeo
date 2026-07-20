import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  User, UserDocument, RefreshToken, RefreshTokenDocument,
  Vault, VaultDocument, VaultItem, VaultItemDocument,
  OrganizationMember, OrganizationMemberDocument,
} from '../schemas';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, UpdateProfileDto, ChangePasswordDto } from './dto';
import { InstanceRole } from '../enums';
import { MailService } from '../mail/mail.service';
import { TwoFactorService } from '../two-factor/two-factor.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../schemas/audit-log.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel(Vault.name) private vaultModel: Model<VaultDocument>,
    @InjectModel(VaultItem.name) private itemModel: Model<VaultItemDocument>,
    @InjectModel(OrganizationMember.name)
    private memberModel: Model<OrganizationMemberDocument>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly twoFactorService: TwoFactorService,
    private readonly auditService: AuditService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({
      $or: [{ email: dto.email }, { username: dto.username }],
    });

    if (existing) {
      if (existing.email === dto.email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.userModel.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: InstanceRole.User,
    });

    // Check if this is the first user (make them superadmin)
    const userCount = await this.userModel.countDocuments();
    if (userCount === 1) {
      user.role = InstanceRole.SuperAdmin;
      await user.save();
    }

    // Send verification email
    const verificationToken = uuidv4();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    this.mailService
      .sendVerificationEmail(user.email, verificationToken)
      .catch(() => {});

    const tokens = await this.generateTokens(user);

    this.auditService.log({ action: AuditAction.UserRegister, userId: user._id.toString() }).catch(() => {});

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.userModel.findOne({
      $or: [{ email: dto.identifier }, { username: dto.identifier }],
    });

    if (!user) {
      this.auditService.log({ action: AuditAction.UserLoginFailed, metadata: { identifier: dto.identifier }, ip, userAgent }).catch(() => {});
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      this.auditService.log({ action: AuditAction.UserLoginFailed, userId: user._id.toString(), ip, userAgent }).catch(() => {});
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.twoFactorEnabled && !dto.twoFactorCode) {
      return {
        requires2FA: true,
        userId: user._id.toString(),
        message: 'Please provide your 2FA code',
      };
    }

    if (user.twoFactorEnabled && dto.twoFactorCode) {
      const isValid = this.twoFactorService.verifyCode(user.twoFactorSecret!, dto.twoFactorCode);
      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = await this.generateTokens(user, ip, userAgent);

    this.auditService.log({ action: AuditAction.UserLogin, userId: user._id.toString(), ip, userAgent }).catch(() => {});

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async verifyLogin2FA(userId: string, code: string, ip?: string, userAgent?: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid request');

    if (!user.twoFactorEnabled) throw new BadRequestException('2FA is not enabled');

    const isValid = this.twoFactorService.verifyCode(user.twoFactorSecret!, code);
    if (!isValid) throw new UnauthorizedException('Invalid 2FA code');

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = await this.generateTokens(user, ip, userAgent);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    const storedToken = await this.refreshTokenModel.findOne({
      token: refreshToken,
      isRevoked: false,
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userModel.findById(storedToken.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    // Revoke old refresh token
    storedToken.isRevoked = true;
    await storedToken.save();

    const tokens = await this.generateTokens(
      user,
      storedToken.ip || undefined,
      storedToken.userAgent || undefined,
    );

    return tokens;
  }

  async logout(refreshToken: string) {
    await this.refreshTokenModel.findOneAndUpdate(
      { token: refreshToken },
      { isRevoked: true },
    );
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      // Don't reveal whether user exists
      return { message: 'If your email is registered, you will receive a reset link' };
    }

    const resetToken = uuidv4();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    this.mailService.sendPasswordReset(user.email, resetToken).catch(() => {});

    return { message: 'If your email is registered, you will receive a reset link' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      passwordResetToken: dto.token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(dto.password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all refresh tokens
    await this.refreshTokenModel.updateMany(
      { userId: user._id },
      { isRevoked: true },
    );

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const emailTaken = await this.userModel.findOne({ email: dto.email, _id: { $ne: userId } });
      if (emailTaken) throw new ConflictException('Email already in use');
      user.email = dto.email;
      user.isEmailVerified = false;
      const verificationToken = uuidv4();
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      this.mailService.sendVerificationEmail(dto.email, verificationToken).catch(() => {});
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;

    await user.save();

    this.auditService.log({ action: AuditAction.UserProfileUpdate, userId, metadata: { fields: Object.keys(dto) } }).catch(() => {});

    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new UnauthorizedException('Current password is incorrect');

    user.password = await bcrypt.hash(dto.newPassword, 12);
    await user.save();

    await this.refreshTokenModel.updateMany({ userId: user._id }, { isRevoked: true });

    this.auditService.log({ action: AuditAction.PasswordChange, userId }).catch(() => {});

    return { message: 'Password changed successfully. Please log in again.' };
  }

  private async generateTokens(
    user: UserDocument,
    ip?: string,
    userAgent?: string,
  ) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.config.get<string>('jwt.expiresIn') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.secret') + '_refresh',
        expiresIn: '30d',
      }),
    ]);

    // Store refresh token
    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 30);

    await this.refreshTokenModel.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: refreshExpires,
      ip,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  // ─── GDPR ────────────────────────────────────────

  async exportUserData(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new NotFoundException('User not found');

    const [vaults, items, memberships] = await Promise.all([
      this.vaultModel.find({ createdBy: userId }).lean(),
      this.itemModel.find({ createdBy: userId }).lean(),
      this.memberModel.find({ userId }).lean(),
    ]);

    return {
      profile: this.sanitizeUser(user),
      vaults,
      vaultItems: items,
      memberships,
      exportedAt: new Date().toISOString(),
    };
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new UnauthorizedException('Incorrect password');
    }

    await Promise.all([
      this.refreshTokenModel.deleteMany({ userId }),
      this.vaultModel.updateMany({ createdBy: userId }, { isActive: false }),
      this.itemModel.updateMany({ createdBy: userId }, { isActive: false }),
      this.memberModel.updateMany({ userId }, { isActive: false }),
    ]);

    user.email = `deleted_${userId}@deleted.arxeo`;
    user.username = `deleted_${userId}`;
    user.password = 'DELETED';
    user.firstName = undefined;
    user.lastName = undefined;
    user.avatar = undefined;
    user.isActive = false;
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    this.auditService.log({ action: AuditAction.UserDeactivate, userId }).catch(() => {});

    return { message: 'Account deleted successfully' };
  }

  private sanitizeUser(user: UserDocument) {
    const obj = user.toObject();
    delete obj.password;
    delete obj.emailVerificationToken;
    delete obj.emailVerificationExpires;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    return obj;
  }

  async handleOAuthUser(profile: {
    googleId: string;
    email: string;
    displayName: string;
    avatar?: string;
  }) {
    let user = await this.userModel.findOne({ email: profile.email });

    if (!user) {
      const username = profile.email.split('@')[0] + '_' + profile.googleId.slice(-4);
      user = await this.userModel.create({
        email: profile.email,
        username,
        firstName: profile.displayName.split(' ')[0],
        lastName: profile.displayName.split(' ').slice(1).join(' '),
        avatar: profile.avatar,
        isEmailVerified: true,
        role: InstanceRole.User,
      });

      const userCount = await this.userModel.countDocuments();
      if (userCount === 1) {
        user.role = InstanceRole.SuperAdmin;
        await user.save();
      }
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = await this.generateTokens(user);

    this.auditService.log({ action: AuditAction.UserLogin, userId: user._id.toString(), metadata: { provider: 'google' } }).catch(() => {});

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }
}
