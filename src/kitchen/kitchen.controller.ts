import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertBranchAccess } from '../common/tenant';
import { KitchenService } from './kitchen.service';
import { PrismaService } from '../prisma/prisma.service';
import { KitchenTicketStatus } from '@prisma/client';

@Controller('kitchen')
export class KitchenController {
  constructor(
    private readonly service: KitchenService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('tickets')
  @RequirePermissions('kitchen.operate')
  async list(
    @CurrentUser() user: AuthUser,
    @Query('branchId') branchId: string,
    @Query('stationId') stationId?: string,
  ) {
    await assertBranchAccess(this.prisma, user, branchId);
    return this.service.listTickets(branchId, stationId);
  }

  @Patch('tickets/:id/status')
  @RequirePermissions('kitchen.operate')
  async status(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const t = await this.prisma.kitchenTicket.findUnique({ where: { id } });
    if (t) await assertBranchAccess(this.prisma, user, t.branchId);
    return this.service.updateTicketStatus(id, body.status as KitchenTicketStatus);
  }
}
