import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertBranchAccess, assertOrgAccess, pickOrgId } from '../common/tenant';
import { MenusService } from './menus.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@Controller()
export class MenusController {
  constructor(
    private readonly service: MenusService,
    private readonly prisma: PrismaService,
  ) {}

  private async menuOrg(menuId: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
      select: { brand: { select: { organizationId: true } } },
    });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu.brand.organizationId;
  }

  private async itemOrg(itemId: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { category: { select: { menu: { select: { brand: { select: { organizationId: true } } } } } } },
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return item.category.menu.brand.organizationId;
  }

  @Get('menus')
  @RequirePermissions('menu.manage')
  async list(
    @CurrentUser() user: AuthUser,
    @Query('brandId') brandId?: string,
    @Query('branchId') branchId?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    const orgId = pickOrgId(user, organizationId);
    if (branchId) {
      const branch = await assertBranchAccess(this.prisma, user, branchId);
      if (!branch || branch.organizationId !== orgId) throw new ForbiddenException();
    }
    if (brandId) {
      const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
      if (!brand || brand.organizationId !== orgId) throw new ForbiddenException();
    }
    return this.service.listMenus(orgId, brandId, branchId);
  }

  @Post('menus')
  @RequirePermissions('menu.manage')
  async createMenu(
    @CurrentUser() user: AuthUser,
    @Body() body: { brandId: string; branchId?: string; name: string },
  ) {
    const brand = await this.prisma.brand.findUnique({ where: { id: body.brandId } });
    if (!brand) throw new NotFoundException('Brand not found');
    assertOrgAccess(user, brand.organizationId);
    if (body.branchId) {
      const branch = await assertBranchAccess(this.prisma, user, body.branchId);
      if (!branch || branch.organizationId !== brand.organizationId || branch.brandId !== body.brandId) {
        throw new ForbiddenException('Branch does not belong to brand');
      }
    }
    return this.service.createMenu(body);
  }

  @Post('menu-categories')
  @RequirePermissions('menu.manage')
  async createCategory(@CurrentUser() user: AuthUser, @Body() body: { menuId: string; name: string; sortOrder?: number }) {
    assertOrgAccess(user, await this.menuOrg(body.menuId));
    return this.service.createCategory(body.menuId, body.name, body.sortOrder);
  }

  @Post('menu-items')
  @RequirePermissions('menu.manage')
  async createItem(@CurrentUser() user: AuthUser, @Body() body: any) {
    const category = await this.prisma.menuCategory.findUnique({ where: { id: body.categoryId } });
    if (!category) throw new NotFoundException('Menu category not found');
    assertOrgAccess(user, await this.menuOrg(category.menuId));
    return this.service.createItem(body);
  }

  @Patch('menu-items/:id')
  @RequirePermissions('menu.manage')
  async updateItem(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    assertOrgAccess(user, await this.itemOrg(id));
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
    const [branch, itemOrg] = await Promise.all([
      this.prisma.branch.findUnique({ where: { id: body.branchId } }),
      this.itemOrg(id),
    ]);
    if (!branch || branch.organizationId !== itemOrg) throw new ForbiddenException();
    return this.service.setBranchAvailability(body.branchId, id, {
      isSoldOut: body.isSoldOut ?? true,
      isAvailable: !(body.isSoldOut ?? true),
    });
  }

  @Post('modifier-groups')
  @RequirePermissions('menu.manage')
  createMg(@CurrentUser() user: AuthUser, @Body() body: any) {
    const organizationId = pickOrgId(user, body.organizationId);
    return this.service.createModifierGroup(organizationId, body.name, body);
  }

  @Post('modifiers')
  @RequirePermissions('menu.manage')
  async createMod(@CurrentUser() user: AuthUser, @Body() body: any) {
    const group = await this.prisma.modifierGroup.findUnique({ where: { id: body.modifierGroupId } });
    if (!group) throw new NotFoundException('Modifier group not found');
    assertOrgAccess(user, group.organizationId);
    return this.service.addModifier(body.modifierGroupId, body.name, body.priceDelta, body.stationId);
  }

  @Post('menu-items/:id/modifier-groups')
  @RequirePermissions('menu.manage')
  async link(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: { modifierGroupId: string }) {
    const [organizationId, group] = await Promise.all([
      this.itemOrg(id),
      this.prisma.modifierGroup.findUnique({ where: { id: body.modifierGroupId } }),
    ]);
    assertOrgAccess(user, organizationId);
    if (!group || group.organizationId !== organizationId) throw new ForbiddenException();
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
