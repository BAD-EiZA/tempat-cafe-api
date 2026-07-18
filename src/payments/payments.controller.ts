import { Body, Controller, Get, Param, Post, Query, BadRequestException } from '@nestjs/common';
import { CurrentUser, Public, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { assertOrgAccess, isPlatformAdmin } from '../common/tenant';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

@Controller()
export class PaymentsController {
  constructor(
    private readonly service: PaymentsService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Public snap: must prove ownership via publicToken (from checkout response)
   * or authenticated merchant with org access.
   */
  @Public()
  @Post('payments/:orderId/snap-token')
  async snap(
    @Param('orderId') orderId: string,
    @Body() body: { publicToken?: string },
    @Query('publicToken') qToken?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    await this.service.assertPaymentAccess(orderId, body?.publicToken || qToken, user);
    return this.service.createSnapForOrder(orderId);
  }

  @Public()
  @Post('webhooks/midtrans')
  webhook(@Body() body: Record<string, any>) {
    return this.service.handleMidtransWebhook(body);
  }

  @Public()
  @Get('payments/:paymentId/status')
  async status(
    @Param('paymentId') paymentId: string,
    @Query('publicToken') publicToken?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });
    if (!payment) throw new ForbiddenException();
    await this.service.assertPaymentAccess(payment.orderId, publicToken, user);
    return this.service.getStatus(paymentId);
  }

  @Public()
  @Post('payments/:paymentId/mock-pay')
  async mockPay(
    @Param('paymentId') paymentId: string,
    @Body() body: { publicToken?: string },
    @Query('publicToken') qToken?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    if (this.config.get('NODE_ENV') === 'production') {
      throw new BadRequestException('Mock pay disabled');
    }
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new ForbiddenException();
    await this.service.assertPaymentAccess(payment.orderId, body?.publicToken || qToken, user);
    return this.service.mockPay(paymentId);
  }

  @Post('payments/:paymentId/refunds')
  @RequirePermissions('payment.refund.request')
  async refund(
    @Param('paymentId') paymentId: string,
    @Body() body: { amount: number; reason: string; idempotencyKey: string },
    @CurrentUser() user: AuthUser,
  ) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new ForbiddenException();
    if (!isPlatformAdmin(user)) assertOrgAccess(user, payment.organizationId);
    return this.service.requestRefund(
      paymentId,
      body.amount,
      body.reason,
      user.id,
      body.idempotencyKey,
    );
  }
}
