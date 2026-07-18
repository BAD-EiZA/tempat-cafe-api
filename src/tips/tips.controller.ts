import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertBranchAccess } from '../common/tenant';
import { TipsService } from './tips.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('tips')
export class TipsController {
  constructor(
    private readonly service: TipsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @RequirePermissions('merchant.read')
  async list(@CurrentUser() user: AuthUser, @Query('branchId') branchId: string) {
    await assertBranchAccess(this.prisma, user, branchId);
    return this.service.listByBranch(branchId);
  }

  @Post(':id/allocate')
  @RequirePermissions('merchant.update')
  allocate(
    @Param('id') id: string,
    @Body() body: { splits: { userId: string; amount: number }[] },
  ) {
    return this.service.allocateToStaff(id, body.splits || []);
  }
}
