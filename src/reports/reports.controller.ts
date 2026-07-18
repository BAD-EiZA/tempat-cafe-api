import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertOrgAccess, pickOrgId } from '../common/tenant';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('sales')
  @RequirePermissions('report.export')
  sales(
    @CurrentUser() user: AuthUser,
    @Query('organizationId') organizationId?: string,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const orgId = pickOrgId(user, organizationId);
    return this.service.sales(orgId, branchId, from, to);
  }

  @Get('operations')
  @RequirePermissions('report.export')
  operations(
    @Query('branchId') branchId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.operations(branchId, from, to);
  }
}
