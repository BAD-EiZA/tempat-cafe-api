import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { CurrentUser, Public, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertOrgAccess, isPlatformAdmin } from '../common/tenant';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly service: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  private async assertOrderAccess(user: AuthUser, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new ForbiddenException('Order not found');
    if (!isPlatformAdmin(user)) assertOrgAccess(user, order.organizationId);
    return order;
  }

  @Get()
  @RequirePermissions('pos.operate')
  list(
    @CurrentUser() user: AuthUser,
    @Query('branchId') branchId?: string,
    @Query('status') status?: OrderStatus,
    @Query('organizationId') organizationId?: string,
  ) {
    const orgId = organizationId || user.organizationIds[0];
    if (orgId) assertOrgAccess(user, orgId);
    return this.service.list({
      branchId,
      status,
      organizationId: isPlatformAdmin(user) ? organizationId : orgId,
    });
  }

  @Get(':id')
  @RequirePermissions('pos.operate')
  async get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.assertOrderAccess(user, id);
    return this.service.get(id);
  }

  @Patch(':id/status')
  @RequirePermissions('order.accept')
  async status(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; reason?: string },
    @CurrentUser() user: AuthUser,
  ) {
    await this.assertOrderAccess(user, id);
    return this.service.updateStatus(id, body.status, user.id, body.reason);
  }

  @Post(':id/void-item')
  @RequirePermissions('order.cancel')
  async voidItem(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { orderItemId: string; reason?: string },
  ) {
    await this.assertOrderAccess(user, id);
    return this.service.voidItem(id, body.orderItemId, user.id, body.reason);
  }

  @Post(':id/transfer-table')
  @RequirePermissions('pos.operate')
  async transfer(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { tableId: string },
  ) {
    await this.assertOrderAccess(user, id);
    return this.service.transferTable(id, body.tableId, user.id);
  }

  @Post(':id/reprint')
  @RequirePermissions('pos.operate')
  async reprint(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.assertOrderAccess(user, id);
    return this.service.reprint(id);
  }

  @Public()
  @Post('checkout')
  checkout(@Body() body: any) {
    return this.service.checkout(body);
  }
}
