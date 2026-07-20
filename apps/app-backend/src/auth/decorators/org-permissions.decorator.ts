import { SetMetadata } from '@nestjs/common';
import { Permission } from '../../enums';

export const ORG_PERMISSIONS_KEY = 'orgPermissions';
export const RequireOrgPermissions = (...permissions: Permission[]) =>
  SetMetadata(ORG_PERMISSIONS_KEY, permissions);
