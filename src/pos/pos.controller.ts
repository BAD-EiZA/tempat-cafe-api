import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertBranchAccess } from '../common/tenant';
import { PosService } from './pos.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('pos')
export class PosController {
  constructor(
    private readonly service: PosService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('active-orders')
  @RequirePermissions('pos.operate')
  async active(@CurrentUser() user: AuthUser, @Query('branchId') branchId: string) {
    await assertBranchAccess(this.prisma, user, branchId);
    return this.service.activeOrders(branchId);
  }

  @Post('orders')
  @RequirePermissions('order.create')
  async create(@CurrentUser() user: AuthUser, @Body() body: any) {
    await assertBranchAccess(this.prisma, user, body.branchId);
    return this.service.createManual(body);
  }

  @Post('shifts/open')
  @RequirePermissions('pos.operate')
  async open(
    @Body() body: { branchId: string; openingCash: number },
    @CurrentUser() user: AuthUser,
  ) {
    await assertBranchAccess(this.prisma, user, body.branchId);
    return this.service.openShift(body.branchId, user.id, body.openingCash);
  }

  @Post('shifts/:id/close')
  @RequirePermissions('pos.operate')
  close(
    @Param('id') id: string,
    @Body() body: { actualCash: number; notes?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.closeShift(id, user.id, body.actualCash, body.notes);
  }

  @Get('sessions')
  @RequirePermissions('pos.operate')
  async sessions(@CurrentUser() user: AuthUser, @Query('branchId') branchId: string) {
    await assertBranchAccess(this.prisma, user, branchId);
    return this.service.listSessions(branchId);
  }

  @Post('sessions/merge')
  @RequirePermissions('pos.operate')
  merge(
    @CurrentUser() user: AuthUser,
    @Body() body: { sourceSessionId: string; targetSessionId: string },
  ) {
    return this.service.mergeSessions(body.sourceSessionId, body.targetSessionId, user.id);
  }
}
