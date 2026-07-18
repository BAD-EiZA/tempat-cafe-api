import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { PayoutsService } from './payouts.service';

@Controller('payouts')
export class PayoutsController {
  constructor(private readonly service: PayoutsService) {}

  @Get()
  @RequirePermissions('payout.view')
  list(@CurrentUser() user: AuthUser, @Query('organizationId') organizationId?: string) {
    return this.service.list(user, organizationId);
  }

  @Post()
  @RequirePermissions('payout.manage')
  create(
    @Body() body: { organizationId: string; amount: number },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createBatch(body.organizationId, body.amount, user);
  }

  @Post(':id/submit')
  @RequirePermissions('payout.manage')
  submit(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.submitApproval(id, user);
  }

  @Post(':id/approve')
  @RequirePermissions('payout.manage')
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.approve(id, user);
  }
}
