import { IsString, MinLength, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @MinLength(1)
  password: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsString()
  @IsOptional()
  @Length(6, 6)
  twoFactorCode?: string;
}
