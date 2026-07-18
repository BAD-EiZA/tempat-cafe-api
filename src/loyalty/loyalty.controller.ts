import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Public, RequirePermissions } from '../common/decorators';
import { LoyaltyService } from './loyalty.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('loyalty')
export class LoyaltyController {
  constructor(
    private readonly service: LoyaltyService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('accounts/:id')
  @RequirePermissions('merchant.read')
  get(@Param('id') id: string) {
    return this.service.getAccount(id);
  }

  @Public()
  @Get('lookup')
  async lookup(
    @Query('organizationId') organizationId: string,
    @Query('phone') phone?: string,
    @Query('customerId') customerId?: string,
  ) {
    if (!organizationId) return null;
    let cid = customerId;
    if (!cid && phone) {
      const c = await this.prisma.customer.findFirst({
        where: { phone: { contains: phone.replace(/\s/g, '') } },
      });
      cid = c?.id;
    }
    if (!cid) return { balance: 0 };
    const acc = await this.service.findAccount(cid, organizationId);
    const discountPerPoint = await this.service.quoteRedeemDiscount(organizationId, 1);
    return {
      customerId: cid,
      accountId: acc?.id,
      balance: acc?.balance ?? 0,
      discountPerPoint,
    };
  }

  @Post('adjustments')
  @RequirePermissions('loyalty.adjust')
  adjust(@Body() body: { accountId: string; points: number; reason: string }) {
    return this.service.adjust(body.accountId, body.points, body.reason);
  }

  @Post('redeem')
  @RequirePermissions('loyalty.adjust')
  redeem(@Body() body: { accountId: string; points: number; orderId?: string }) {
    return this.service.redeem(body.accountId, body.points, body.orderId);
  }
}
