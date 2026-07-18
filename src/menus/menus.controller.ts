import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertBranchAccess, isPlatformAdmin } from '../common/tenant';
import { MenusService } from './menus.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

@Controller()
export class MenusController {
  constructor(
    private readonly service: MenusService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('menus')
  @RequirePermissions('menu.manage')
  async list(
    @CurrentUser() user: AuthUser,
    @Query('brandId') brandId?: string,
    @Query('branchId') branchId?: string,
  ) {
    if (branchId) await assertBranchAccess(this.prisma, user, branchId);
    if (brandId && !isPlatformAdmin(user)) {
      const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
      if (!brand || !user.organizationIds.includes(brand.organizationId)) {
        throw new ForbiddenException();
      }
    }
    return this.service.listMenus(brandId, branchId);
  }

  @Post('menus')
  @RequirePermissions('menu.manage')
  async createMenu(
    @CurrentUser() user: AuthUser,
    @Body() body: { brandId: string; branchId?: string; name: string },
  ) {
    if (body.branchId) await assertBranchAccess(this.prisma, user, body.branchId);
    return this.service.createMenu(body);
  }

  @Post('menu-categories')
  @RequirePermissions('menu.manage')
  createCategory(@Body() body: { menuId: string; name: string; sortOrder?: number }) {
    return this.service.createCategory(body.menuId, body.name, body.sortOrder);
  }

  @Post('menu-items')
  @RequirePermissions('menu.manage')
  createItem(@Body() body: any) {
    return this.service.createItem(body);
  }

  @Patch('menu-items/:id')
  @RequirePermissions('menu.manage')
  updateItem(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.updateItem(id, body);
  }

  @Post('menu-items/:id/sold-out')
  @RequirePermissions('menu.manage')
  async soldOut(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { branchId: string; isSoldOut?: boolean },
  ) {
    await assertBranchAccess(this.prisma, user, body.branchId);
    return this.service.setBranchAvailability(body.branchId, id, {
      isSoldOut: body.isSoldOut ?? true,
      isAvailable: !(body.isSoldOut ?? true),
    });
  }

  @Post('modifier-groups')
  @RequirePermissions('menu.manage')
  createMg(@Body() body: any) {
    return this.service.createModifierGroup(body.name, body);
  }

  @Post('modifiers')
  @RequirePermissions('menu.manage')
  createMod(@Body() body: any) {
    return this.service.addModifier(body.modifierGroupId, body.name, body.priceDelta, body.stationId);
  }

  @Post('menu-items/:id/modifier-groups')
  @RequirePermissions('menu.manage')
  link(@Param('id') id: string, @Body() body: { modifierGroupId: string }) {
    return this.service.linkModifierGroup(id, body.modifierGroupId);
  }

  @Get('stations')
  @RequirePermissions('menu.manage')
  async stations(@CurrentUser() user: AuthUser, @Query('branchId') branchId: string) {
    await assertBranchAccess(this.prisma, user, branchId);
    return this.prisma.kitchenStation.findMany({
      where: { branchId },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
