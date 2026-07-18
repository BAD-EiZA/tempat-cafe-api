import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { CurrentUser, Public, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertBranchAccess } from '../common/tenant';
import { PrintersService } from './printers.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class PrintersController {
  constructor(
    private readonly service: PrintersService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('printers')
  @RequirePermissions('printer.manage')
  async create(@CurrentUser() user: AuthUser, @Body() body: any) {
    await assertBranchAccess(this.prisma, user, body.branchId);
    return this.service.createDevice(body);
  }

  @Get('printers')
  @RequirePermissions('printer.manage')
  async list(@CurrentUser() user: AuthUser, @Query('branchId') branchId: string) {
    await assertBranchAccess(this.prisma, user, branchId);
    return this.service.listDevices(branchId);
  }

  @Post('printers/map-station')
  @RequirePermissions('printer.manage')
  map(@Body() body: { printerId: string; stationId: string; copies?: number }) {
    return this.service.mapStation(body.printerId, body.stationId, true, body.copies);
  }

  @Post('printers/agents/register')
  @RequirePermissions('printer.manage')
  async register(
    @CurrentUser() user: AuthUser,
    @Body() body: { branchId: string; name: string },
  ) {
    await assertBranchAccess(this.prisma, user, body.branchId);
    return this.service.registerAgent(body.branchId, body.name);
  }

  @Public()
  @Post('printers/agents/heartbeat')
  heartbeat(@Headers('x-device-token') token: string) {
    return this.service.heartbeat(token);
  }

  @Public()
  @Get('printers/jobs/next')
  next(@Headers('x-device-token') token: string) {
    return this.service.nextJob(token);
  }

  @Public()
  @Post('printers/jobs/:id/ack')
  ack(@Param('id') id: string, @Headers('x-device-token') token: string) {
    return this.service.ack(id, token);
  }

  @Public()
  @Post('printers/jobs/:id/fail')
  fail(
    @Param('id') id: string,
    @Headers('x-device-token') token: string,
    @Body() body: { error?: string },
  ) {
    return this.service.fail(id, token, body.error);
  }

  @Post('print-jobs/:id/retry')
  @RequirePermissions('printer.manage')
  retry(@Param('id') id: string) {
    return this.service.retry(id);
  }

  @Get('printers/agents')
  @RequirePermissions('printer.manage')
  async agents(@CurrentUser() user: AuthUser, @Query('branchId') branchId: string) {
    await assertBranchAccess(this.prisma, user, branchId);
    return this.service.listAgents(branchId);
  }
}
