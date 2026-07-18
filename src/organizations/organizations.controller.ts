import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertOrgAccess } from '../common/tenant';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.service.listForUser(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      name: string;
      legalName?: string;
      email?: string;
      phone?: string;
      brandName?: string;
      branchName?: string;
    },
  ) {
    return this.service.create(user.id, body);
  }

  @Get(':id')
  @RequirePermissions('merchant.read')
  get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    assertOrgAccess(user, id);
    return this.service.get(id);
  }

  @Patch(':id')
  @RequirePermissions('merchant.update')
  update(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() body: Record<string, unknown>) {
    assertOrgAccess(user, id);
    return this.service.update(id, user.id, body);
  }

  @Post(':id/submit')
  @RequirePermissions('merchant.update')
  submit(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    assertOrgAccess(user, id);
    return this.service.submitOnboarding(id, user.id);
  }

  @Post(':id/payout-accounts')
  @RequirePermissions('merchant.update')
  payout(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { bankName: string; accountName: string; accountNumber: string },
  ) {
    assertOrgAccess(user, id);
    return this.service.setPayoutAccount(id, user.id, body);
  }

  @Get(':id/members')
  @RequirePermissions('merchant.read')
  members(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    assertOrgAccess(user, id);
    return this.service.listMembers(id);
  }

  @Post(':id/members')
  @RequirePermissions('merchant.update')
  invite(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { email: string; name?: string; roleCode?: string },
  ) {
    assertOrgAccess(user, id);
    return this.service.inviteMember(id, user.id, body);
  }

  @Post(':id/members/:userId/remove')
  @RequirePermissions('merchant.update')
  remove(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: AuthUser,
  ) {
    assertOrgAccess(user, id);
    return this.service.removeMember(id, userId, user.id);
  }
}
