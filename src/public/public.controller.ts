import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Public } from '../common/decorators';
import { HomepageService } from '../homepage/homepage.service';
import { MenusService } from '../menus/menus.service';
import { TablesService } from '../tables/tables.service';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly homepage: HomepageService,
    private readonly menus: MenusService,
    private readonly tables: TablesService,
    private readonly orders: OrdersService,
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
  ) {}

  @Public()
  @Get('cafes/:slug')
  cafe(@Param('slug') slug: string) {
    return this.homepage.getPublicBySlug(slug);
  }

  @Public()
  @Get('cafes/:slug/:branchSlug')
  cafeBranch(@Param('slug') slug: string, @Param('branchSlug') branchSlug: string) {
    return this.homepage.getPublicBySlug(slug, branchSlug);
  }

  @Public()
  @Get('cafes/:slug/menu')
  async menu(@Param('slug') slug: string) {
    const brand = await this.prisma.brand.findFirst({
      where: { slug },
      include: { branches: { where: { status: 'ACTIVE' }, take: 1 } },
    });
    if (!brand?.branches[0]) {
      const branch = await this.prisma.branch.findFirst({
        where: { slug, status: 'ACTIVE' },
      });
      if (!branch) return { menus: [] };
      return this.menus.getPublicMenu(branch.id);
    }
    return this.menus.getPublicMenu(brand.branches[0].id);
  }

  @Public()
  @Get('branches/:branchId/menu')
  branchMenu(@Param('branchId') branchId: string) {
    return this.menus.getPublicMenu(branchId);
  }

  @Public()
  @Get('qr/:token')
  qr(@Param('token') token: string) {
    return this.tables.resolveQr(token);
  }

  @Public()
  @Post('carts/validate')
  async validateCart(
    @Body()
    body: {
      branchId: string;
      items: {
        menuItemId: string;
        quantity: number;
        modifiers?: { name: string; priceDelta: number }[];
      }[];
      tipAmount?: number;
    },
  ) {
    const branch = await this.prisma.branch.findUnique({ where: { id: body.branchId } });
    if (!branch) return { error: 'branch not found' };
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: body.items.map((i) => i.menuItemId) } },
      include: { branchItems: { where: { branchId: body.branchId } } },
    });
    const map = new Map(menuItems.map((m) => [m.id, m]));
    const lines = body.items.map((i) => {
      const mi = map.get(i.menuItemId)!;
      const ov = mi.branchItems[0];
      return {
        name: mi.name,
        unitPrice: ov?.price ?? mi.basePrice,
        quantity: i.quantity,
        modifiers: i.modifiers || [],
        menuItemId: mi.id,
      };
    });
    return this.pricing.calculate({
      lines,
      taxBps: branch.taxBps,
      serviceChargeBps: branch.serviceChargeBps,
      tipAmount: body.tipAmount,
    });
  }

  @Public()
  @Post('orders/checkout')
  checkout(@Body() body: any) {
    return this.orders.checkout(body);
  }

  @Public()
  @Get('orders/:publicToken')
  order(@Param('publicToken') publicToken: string) {
    return this.orders.getByPublicToken(publicToken);
  }

  @Public()
  @Post('orders/:publicToken/reorder')
  reorder(@Param('publicToken') publicToken: string, @Body() body: any) {
    return this.orders.reorder(publicToken, body);
  }
}
