import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, Public, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertBranchAccess } from '../common/tenant';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class ReservationsController {
  constructor(
    private readonly service: ReservationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Post('public/reservations/availability')
  availability(
    @Body() body: { branchId: string; startAt: string; guestCount: number },
  ) {
    return this.service.availability(body.branchId, new Date(body.startAt), body.guestCount);
  }

  @Public()
  @Post('public/reservations')
  createPublic(@Body() body: any) {
    return this.service.create(body);
  }

  @Get('reservations')
  @RequirePermissions('reservation.manage')
  async list(
    @CurrentUser() user: AuthUser,
    @Query('branchId') branchId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    await assertBranchAccess(this.prisma, user, branchId);
    return this.service.list(branchId, from, to);
  }

  @Patch('reservations/:id/status')
  @RequirePermissions('reservation.manage')
  async status(
    @Param('id') id: string,
    @Body() body: { status: string },
    @CurrentUser() user: AuthUser,
  ) {
    const r = await this.prisma.reservation.findUnique({ where: { id } });
    if (r) await assertBranchAccess(this.prisma, user, r.branchId);
    return this.service.updateStatus(id, body.status, user.id);
  }

  @Post('reservations/settings')
  @RequirePermissions('reservation.manage')
  async settings(
    @CurrentUser() user: AuthUser,
    @Body() body: { branchId: string } & Record<string, unknown>,
  ) {
    const { branchId, ...rest } = body;
    await assertBranchAccess(this.prisma, user, branchId);
    return this.service.updateSettings(branchId, rest);
  }

  @Post('reservations/:id/confirm-deposit')
  @RequirePermissions('reservation.manage')
  async confirmDeposit(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const r = await this.prisma.reservation.findUnique({ where: { id } });
    if (r) await assertBranchAccess(this.prisma, user, r.branchId);
    return this.service.confirmDeposit(id);
  }

  @Post('reservations/:id/no-show')
  @RequirePermissions('reservation.manage')
  async noShow(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const r = await this.prisma.reservation.findUnique({ where: { id } });
    if (r) await assertBranchAccess(this.prisma, user, r.branchId);
    return this.service.updateStatus(id, 'NO_SHOW', user.id);
  }
}
