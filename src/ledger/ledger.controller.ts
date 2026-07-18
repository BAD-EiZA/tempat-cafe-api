import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { pickOrgId } from '../common/tenant';
import { LedgerService } from './ledger.service';

@Controller('ledger')
export class LedgerController {
  constructor(private readonly service: LedgerService) {}

  @Get()
  @RequirePermissions('payout.view')
  list(@CurrentUser() user: AuthUser, @Query('organizationId') organizationId?: string) {
    return this.service.list(pickOrgId(user, organizationId));
  }

  @Get('balance')
  @RequirePermissions('payout.view')
  balance(@CurrentUser() user: AuthUser, @Query('organizationId') organizationId?: string) {
    return this.service.balance(pickOrgId(user, organizationId));
  }
}
