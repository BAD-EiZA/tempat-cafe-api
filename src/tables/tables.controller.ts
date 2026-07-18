import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertBranchAccess } from '../common/tenant';
import { TablesService } from './tables.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class TablesController {
  constructor(
    private readonly service: TablesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('areas')
  @RequirePermissions('table.manage')
  async listAreas(@CurrentUser() user: AuthUser, @Query('branchId') branchId: string) {
    await assertBranchAccess(this.prisma, user, branchId);
    return this.service.listAreas(branchId);
  }

  @Post('areas')
  @RequirePermissions('table.manage')
  async createArea(
    @CurrentUser() user: AuthUser,
    @Body() body: { branchId: string; name: string; type?: string },
  ) {
    await assertBranchAccess(this.prisma, user, body.branchId);
    return this.service.createArea(body.branchId, body.name, body.type);
  }

  @Get('tables')
  @RequirePermissions('table.manage')
  async listTables(@CurrentUser() user: AuthUser, @Query('branchId') branchId: string) {
    await assertBranchAccess(this.prisma, user, branchId);
    return this.service.listTables(branchId);
  }

  @Get('tables/floor-map')
  @RequirePermissions('table.manage')
  async floorMap(@CurrentUser() user: AuthUser, @Query('branchId') branchId: string) {
    await assertBranchAccess(this.prisma, user, branchId);
    return this.service.floorMap(branchId);
  }

  @Post('tables')
  @RequirePermissions('table.manage')
  async createTable(@CurrentUser() user: AuthUser, @Body() body: any) {
    await assertBranchAccess(this.prisma, user, body.branchId);
    return this.service.createTable(body);
  }

  @Post('tables/:id/rotate-qr')
  @RequirePermissions('table.manage')
  async rotate(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const t = await this.prisma.cafeTable.findUnique({ where: { id } });
    if (t) await assertBranchAccess(this.prisma, user, t.branchId);
    return this.service.rotateQr(id);
  }

  @Patch('tables/:id/status')
  @RequirePermissions('table.manage')
  async status(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const t = await this.prisma.cafeTable.findUnique({ where: { id } });
    if (t) await assertBranchAccess(this.prisma, user, t.branchId);
    return this.service.updateStatus(id, body.status);
  }

  @Patch('tables/:id/position')
  @RequirePermissions('table.manage')
  async position(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { posX: number; posY: number },
  ) {
    const t = await this.prisma.cafeTable.findUnique({ where: { id } });
    if (t) await assertBranchAccess(this.prisma, user, t.branchId);
    return this.service.updatePosition(id, Number(body.posX), Number(body.posY));
  }
}
