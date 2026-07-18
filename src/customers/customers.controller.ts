import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { pickOrgId } from '../common/tenant';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  @RequirePermissions('merchant.read')
  list(
    @CurrentUser() user: AuthUser,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.service.list(pickOrgId(user, organizationId));
  }

  @Get(':id')
  @RequirePermissions('merchant.read')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string, @Query('organizationId') organizationId?: string) {
    return this.service.get(id, pickOrgId(user, organizationId));
  }

  @Post('me')
  me(@CurrentUser() user: AuthUser) {
    return this.service.upsertFromUser(user.id, {
      name: user.name || undefined,
      email: user.email || undefined,
    });
  }
}
