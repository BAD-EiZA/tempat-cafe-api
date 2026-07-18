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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenusController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const tenant_1 = require("../common/tenant");
const menus_service_1 = require("./menus.service");
const prisma_service_1 = require("../prisma/prisma.service");
const common_2 = require("@nestjs/common");
let MenusController = class MenusController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    async menuOrg(menuId) {
        const menu = await this.prisma.menu.findUnique({
            where: { id: menuId },
            select: { brand: { select: { organizationId: true } } },
        });
        if (!menu)
            throw new common_2.NotFoundException('Menu not found');
        return menu.brand.organizationId;
    }
    async itemOrg(itemId) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id: itemId },
            select: { category: { select: { menu: { select: { brand: { select: { organizationId: true } } } } } } },
        });
        if (!item)
            throw new common_2.NotFoundException('Menu item not found');
        return item.category.menu.brand.organizationId;
    }
    async list(user, brandId, branchId, organizationId) {
        const orgId = (0, tenant_1.pickOrgId)(user, organizationId);
        if (branchId) {
            const branch = await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
            if (!branch || branch.organizationId !== orgId)
                throw new common_2.ForbiddenException();
        }
        if (brandId) {
            const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
            if (!brand || brand.organizationId !== orgId)
                throw new common_2.ForbiddenException();
        }
        return this.service.listMenus(orgId, brandId, branchId);
    }
    async createMenu(user, body) {
        const brand = await this.prisma.brand.findUnique({ where: { id: body.brandId } });
        if (!brand)
            throw new common_2.NotFoundException('Brand not found');
        (0, tenant_1.assertOrgAccess)(user, brand.organizationId);
        if (body.branchId) {
            const branch = await (0, tenant_1.assertBranchAccess)(this.prisma, user, body.branchId);
            if (!branch || branch.organizationId !== brand.organizationId || branch.brandId !== body.brandId) {
                throw new common_2.ForbiddenException('Branch does not belong to brand');
            }
        }
        return this.service.createMenu(body);
    }
    async createCategory(user, body) {
        (0, tenant_1.assertOrgAccess)(user, await this.menuOrg(body.menuId));
        return this.service.createCategory(body.menuId, body.name, body.sortOrder);
    }
    async createItem(user, body) {
        const category = await this.prisma.menuCategory.findUnique({ where: { id: body.categoryId } });
        if (!category)
            throw new common_2.NotFoundException('Menu category not found');
        (0, tenant_1.assertOrgAccess)(user, await this.menuOrg(category.menuId));
        return this.service.createItem(body);
    }
    async updateItem(user, id, body) {
        (0, tenant_1.assertOrgAccess)(user, await this.itemOrg(id));
        return this.service.updateItem(id, body);
    }
    async soldOut(user, id, body) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, body.branchId);
        const [branch, itemOrg] = await Promise.all([
            this.prisma.branch.findUnique({ where: { id: body.branchId } }),
            this.itemOrg(id),
        ]);
        if (!branch || branch.organizationId !== itemOrg)
            throw new common_2.ForbiddenException();
        return this.service.setBranchAvailability(body.branchId, id, {
            isSoldOut: body.isSoldOut ?? true,
            isAvailable: !(body.isSoldOut ?? true),
        });
    }
    createMg(user, body) {
        const organizationId = (0, tenant_1.pickOrgId)(user, body.organizationId);
        return this.service.createModifierGroup(organizationId, body.name, body);
    }
    async createMod(user, body) {
        const group = await this.prisma.modifierGroup.findUnique({ where: { id: body.modifierGroupId } });
        if (!group)
            throw new common_2.NotFoundException('Modifier group not found');
        (0, tenant_1.assertOrgAccess)(user, group.organizationId);
        return this.service.addModifier(body.modifierGroupId, body.name, body.priceDelta, body.stationId);
    }
    async link(user, id, body) {
        const [organizationId, group] = await Promise.all([
            this.itemOrg(id),
            this.prisma.modifierGroup.findUnique({ where: { id: body.modifierGroupId } }),
        ]);
        (0, tenant_1.assertOrgAccess)(user, organizationId);
        if (!group || group.organizationId !== organizationId)
            throw new common_2.ForbiddenException();
        return this.service.linkModifierGroup(id, body.modifierGroupId);
    }
    async stations(user, branchId) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        return this.prisma.kitchenStation.findMany({
            where: { branchId },
            orderBy: { sortOrder: 'asc' },
        });
    }
};
exports.MenusController = MenusController;
__decorate([
    (0, common_1.Get)('menus'),
    (0, decorators_1.RequirePermissions)('menu.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('brandId')),
    __param(2, (0, common_1.Query)('branchId')),
    __param(3, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('menus'),
    (0, decorators_1.RequirePermissions)('menu.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "createMenu", null);
__decorate([
    (0, common_1.Post)('menu-categories'),
    (0, decorators_1.RequirePermissions)('menu.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Post)('menu-items'),
    (0, decorators_1.RequirePermissions)('menu.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "createItem", null);
__decorate([
    (0, common_1.Patch)('menu-items/:id'),
    (0, decorators_1.RequirePermissions)('menu.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Post)('menu-items/:id/sold-out'),
    (0, decorators_1.RequirePermissions)('menu.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "soldOut", null);
__decorate([
    (0, common_1.Post)('modifier-groups'),
    (0, decorators_1.RequirePermissions)('menu.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "createMg", null);
__decorate([
    (0, common_1.Post)('modifiers'),
    (0, decorators_1.RequirePermissions)('menu.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "createMod", null);
__decorate([
    (0, common_1.Post)('menu-items/:id/modifier-groups'),
    (0, decorators_1.RequirePermissions)('menu.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "link", null);
__decorate([
    (0, common_1.Get)('stations'),
    (0, decorators_1.RequirePermissions)('menu.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "stations", null);
exports.MenusController = MenusController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [menus_service_1.MenusService,
        prisma_service_1.PrismaService])
], MenusController);
//# sourceMappingURL=menus.controller.js.map