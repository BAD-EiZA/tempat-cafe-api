import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertBranchAccess, pickOrgId } from '../common/tenant';
import { BranchesService } from './branches.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('branches')
export class BranchesController {
  constructor(
    private readonly service: BranchesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @RequirePermissions('merchant.read')
  list(@CurrentUser() user: AuthUser, @Query('organizationId') organizationId?: string) {
    const orgId = pickOrgId(user, organizationId);
    return this.service.list(orgId);
  }

  @Get(':id')
  @RequirePermissions('merchant.read')
  async get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await assertBranchAccess(this.prisma, user, id);
    return this.service.get(id);
  }

  @Post()
  @RequirePermissions('branch.manage')
  create(@CurrentUser() user: AuthUser, @Body() body: any) {
    pickOrgId(user, body.organizationId);
    return this.service.create(body);
  }

  @Patch(':id')
  @RequirePermissions('branch.manage')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    await assertBranchAccess(this.prisma, user, id);
    return this.service.update(id, body);
  }

  @Post(':id/hours')
  @RequirePermissions('branch.manage')
  async hours(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { hours: any[] },
  ) {
    await assertBranchAccess(this.prisma, user, id);
    return this.service.setHours(id, body.hours || []);
  }
}
