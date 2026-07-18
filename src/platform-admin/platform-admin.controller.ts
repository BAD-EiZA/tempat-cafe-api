import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { PlatformAdminService } from './platform-admin.service';
import { PayoutsService } from '../payouts/payouts.service';

@Controller('platform')
export class PlatformAdminController {
  constructor(
    private readonly service: PlatformAdminService,
    private readonly payouts: PayoutsService,
  ) {}

  @Get('merchants')
  @RequirePermissions('platform.admin')
  merchants(@Query('q') q?: string) {
    return this.service.listMerchants(q);
  }

  @Patch('merchants/:id/status')
  @RequirePermissions('platform.admin')
  status(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.setMerchantStatus(id, body.status, user.id, body.reason);
  }

  @Get('payments')
  @RequirePermissions('platform.admin')
  payments() {
    return this.service.listPayments();
  }

  @Get('reconciliation')
  @RequirePermissions('platform.admin')
  recon() {
    return this.service.listReconciliation();
  }

  @Post('reconciliation/run')
  @RequirePermissions('platform.admin')
  runRecon() {
    return this.service.runReconciliation();
  }

  @Get('audit-logs')
  @RequirePermissions('platform.admin')
  audit(@Query('organizationId') organizationId?: string) {
    return this.service.listAudit(organizationId);
  }

  @Get('metrics')
  @RequirePermissions('platform.admin')
  metrics() {
    return this.service.platformMetrics();
  }

  @Post('payout-batches')
  @RequirePermissions('payout.manage')
  createPayout(
    @Body() body: { organizationId: string; amount: number },
    @CurrentUser() user: AuthUser,
  ) {
    return this.payouts.createBatch(body.organizationId, body.amount, user.id);
  }

  @Post('payout-batches/:id/approve')
  @RequirePermissions('payout.manage')
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.payouts.approve(id, user.id);
  }

  @Post('ledger-adjustments')
  @RequirePermissions('ledger.adjust')
  adjust(
    @Body() body: { organizationId: string; amount: number; reason: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.adjustLedger(body.organizationId, body.amount, body.reason, user.id);
  }

  @Post('impersonate/:organizationId')
  @RequirePermissions('platform.admin')
  impersonate(@Param('organizationId') organizationId: string, @CurrentUser() user: AuthUser) {
    return this.service.impersonate(organizationId, user.id);
  }

  @Post('payout-batches/:id/submit')
  @RequirePermissions('payout.manage')
  submitPayout(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.payouts.submitApproval(id, user.id);
  }
}
