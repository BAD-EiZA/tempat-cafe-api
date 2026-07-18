import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  createMenu(dto: { brandId: string; branchId?: string; name: string }) {
    return this.prisma.menu.create({ data: dto });
  }

  listMenus(brandId?: string, branchId?: string) {
    return this.prisma.menu.findMany({
      where: {
        ...(brandId ? { brandId } : {}),
        ...(branchId ? { branchId } : {}),
      },
      include: {
        categories: {
          include: {
            items: {
              where: { deletedAt: null },
              include: {
                images: true,
                variantGroups: { include: { options: true } },
                modifierLinks: { include: { modifierGroup: { include: { modifiers: true } } } },
                branchItems: true,
              },
            },
          },
        },
      },
    });
  }

  createCategory(menuId: string, name: string, sortOrder = 0) {
    return this.prisma.menuCategory.create({ data: { menuId, name, sortOrder } });
  }

  createItem(dto: {
    categoryId: string;
    name: string;
    slug: string;
    basePrice: number;
    description?: string;
    stationId?: string;
    labels?: string[];
    allergens?: string[];
  }) {
    return this.prisma.menuItem.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        slug: dto.slug,
        basePrice: dto.basePrice,
        description: dto.description,
        stationId: dto.stationId,
        labels: dto.labels || [],
        allergens: dto.allergens || [],
      },
    });
  }

  async updateItem(id: string, dto: Record<string, unknown>) {
    return this.prisma.menuItem.update({
      where: { id },
      data: {
        name: dto.name as string | undefined,
        description: dto.description as string | undefined,
        basePrice: dto.basePrice as number | undefined,
        stationId: dto.stationId as string | undefined,
        isActive: dto.isActive as boolean | undefined,
        maxPerOrder: dto.maxPerOrder as number | undefined,
        labels: dto.labels as string[] | undefined,
        allergens: dto.allergens as string[] | undefined,
      },
    });
  }

  setBranchAvailability(branchId: string, menuItemId: string, data: {
    price?: number;
    isAvailable?: boolean;
    isSoldOut?: boolean;
  }) {
    return this.prisma.branchMenuItem.upsert({
      where: { branchId_menuItemId: { branchId, menuItemId } },
      create: { branchId, menuItemId, ...data },
      update: data,
    });
  }

  async getPublicMenu(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { brand: true },
    });
    if (!branch) throw new NotFoundException('Branch not found');

    const menus = await this.prisma.menu.findMany({
      where: {
        isActive: true,
        OR: [{ brandId: branch.brandId, branchId: null }, { branchId }],
      },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              where: { isActive: true, deletedAt: null },
              include: {
                images: true,
                variantGroups: { include: { options: true } },
                modifierLinks: {
                  include: { modifierGroup: { include: { modifiers: true } } },
                },
                branchItems: { where: { branchId } },
              },
            },
          },
        },
      },
    });

    return {
      branch: {
        id: branch.id,
        name: branch.name,
        organizationId: branch.organizationId,
        taxBps: branch.taxBps,
        serviceChargeBps: branch.serviceChargeBps,
        brand: branch.brand,
      },
      menus: menus.map((m) => ({
        ...m,
        categories: m.categories.map((c) => ({
          ...c,
          items: c.items
            .filter((i) => {
              const ov = i.branchItems[0];
              return !ov || (ov.isAvailable && !ov.isSoldOut);
            })
            .map((i) => {
              const ov = i.branchItems[0];
              return {
                id: i.id,
                name: i.name,
                slug: i.slug,
                description: i.description,
                price: ov?.price ?? i.basePrice,
                images: i.images,
                labels: i.labels,
                allergens: i.allergens,
                stationId: i.stationId,
                variantGroups: i.variantGroups,
                modifierGroups: i.modifierLinks.map((l) => l.modifierGroup),
              };
            }),
        })),
      })),
    };
  }

  createModifierGroup(name: string, opts?: { required?: boolean; minSelect?: number; maxSelect?: number }) {
    return this.prisma.modifierGroup.create({
      data: {
        name,
        required: opts?.required ?? false,
        minSelect: opts?.minSelect ?? 0,
        maxSelect: opts?.maxSelect ?? 1,
      },
    });
  }

  addModifier(modifierGroupId: string, name: string, priceDelta = 0, stationId?: string) {
    return this.prisma.modifier.create({
      data: { modifierGroupId, name, priceDelta, stationId },
    });
  }

  linkModifierGroup(menuItemId: string, modifierGroupId: string, sortOrder = 0) {
    return this.prisma.menuItemModifierGroup.create({
      data: { menuItemId, modifierGroupId, sortOrder },
    });
  }
}
