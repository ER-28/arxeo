import { IsString, IsOptional, IsEnum, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrgRole } from '../../enums';

export class CreateOrgDto {
  @ApiProperty({ example: 'My Team' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'A team for managing passwords' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'free', enum: ['free', 'standard', 'pro', 'enterprise'] })
  @IsString()
  @IsOptional()
  plan?: string;
}

export class UpdateOrgDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logo?: string;
}

export class InviteMemberDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiPropertyOptional({ enum: OrgRole, default: OrgRole.Member })
  @IsEnum(OrgRole)
  @IsOptional()
  role?: OrgRole;
}
