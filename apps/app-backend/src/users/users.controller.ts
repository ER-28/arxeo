import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards';
import { RequirePermissions } from '../auth/decorators';
import { Permission } from '../enums';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(Permission.InstanceUsersManage)
  @ApiOperation({ summary: 'List all users (admin only)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(
      parseInt(page || '1'),
      parseInt(limit || '20'),
      search,
    );
  }

  @Get(':id')
  @RequirePermissions(Permission.InstanceUsersManage)
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/role')
  @RequirePermissions(Permission.InstanceManage)
  @ApiOperation({ summary: 'Update user role (superadmin only)' })
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(id, role);
  }

  @Patch(':id/deactivate')
  @RequirePermissions(Permission.InstanceUsersManage)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate user (admin only)' })
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/activate')
  @RequirePermissions(Permission.InstanceUsersManage)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate user (admin only)' })
  async activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Delete(':id')
  @RequirePermissions(Permission.InstanceManage)
  @ApiOperation({ summary: 'Delete user (superadmin only)' })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
