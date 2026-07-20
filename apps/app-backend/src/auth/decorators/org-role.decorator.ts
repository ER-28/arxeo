import { SetMetadata } from '@nestjs/common';
import { OrgRole } from '../../enums';

export const ORG_ROLE_KEY = 'orgRole';
export const RequireOrgRole = (...roles: OrgRole[]) =>
  SetMetadata(ORG_ROLE_KEY, roles);
