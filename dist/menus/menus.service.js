"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MenusService = class MenusService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    createMenu(dto) {
        return this.prisma.menu.create({ data: dto });
    }
    listMenus(organizationId, brandId, branchId) {
        return this.prisma.menu.findMany({
            where: {
                brand: { organizationId },
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
    createCategory(menuId, name, sortOrder = 0) {
        return this.prisma.menuCategory.create({ data: { menuId, name, sortOrder } });
    }
    createItem(dto) {
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
    async updateItem(id, dto) {
        return this.prisma.menuItem.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                basePrice: dto.basePrice,
                stationId: dto.stationId,
                isActive: dto.isActive,
                maxPerOrder: dto.maxPerOrder,
                labels: dto.labels,
                allergens: dto.allergens,
            },
        });
    }
    setBranchAvailability(branchId, menuItemId, data) {
        return this.prisma.branchMenuItem.upsert({
            where: { branchId_menuItemId: { branchId, menuItemId } },
            create: { branchId, menuItemId, ...data },
            update: data,
        });
    }
    async getPublicMenu(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
            include: { brand: true },
        });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
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
    createModifierGroup(organizationId, name, opts) {
        return this.prisma.modifierGroup.create({
            data: {
                organizationId,
                name,
                required: opts?.required ?? false,
                minSelect: opts?.minSelect ?? 0,
                maxSelect: opts?.maxSelect ?? 1,
            },
        });
    }
    addModifier(modifierGroupId, name, priceDelta = 0, stationId) {
        return this.prisma.modifier.create({
            data: { modifierGroupId, name, priceDelta, stationId },
        });
    }
    linkModifierGroup(menuItemId, modifierGroupId, sortOrder = 0) {
        return this.prisma.menuItemModifierGroup.create({
            data: { menuItemId, modifierGroupId, sortOrder },
        });
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusService);
//# sourceMappingURL=menus.service.js.map