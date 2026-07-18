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
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const homepage_service_1 = require("../homepage/homepage.service");
const menus_service_1 = require("../menus/menus.service");
const tables_service_1 = require("../tables/tables.service");
const orders_service_1 = require("../orders/orders.service");
const prisma_service_1 = require("../prisma/prisma.service");
const pricing_service_1 = require("../pricing/pricing.service");
let PublicController = class PublicController {
    constructor(homepage, menus, tables, orders, prisma, pricing) {
        this.homepage = homepage;
        this.menus = menus;
        this.tables = tables;
        this.orders = orders;
        this.prisma = prisma;
        this.pricing = pricing;
    }
    cafe(slug) {
        return this.homepage.getPublicBySlug(slug);
    }
    cafeBranch(slug, branchSlug) {
        return this.homepage.getPublicBySlug(slug, branchSlug);
    }
    async menu(slug) {
        const brand = await this.prisma.brand.findFirst({
            where: { slug },
            include: { branches: { where: { status: 'ACTIVE' }, take: 1 } },
        });
        if (!brand?.branches[0]) {
            const branch = await this.prisma.branch.findFirst({
                where: { slug, status: 'ACTIVE' },
            });
            if (!branch)
                return { menus: [] };
            return this.menus.getPublicMenu(branch.id);
        }
        return this.menus.getPublicMenu(brand.branches[0].id);
    }
    branchMenu(branchId) {
        return this.menus.getPublicMenu(branchId);
    }
    qr(token) {
        return this.tables.resolveQr(token);
    }
    async validateCart(body) {
        const branch = await this.prisma.branch.findUnique({ where: { id: body.branchId } });
        if (!branch)
            return { error: 'branch not found' };
        const menuItems = await this.prisma.menuItem.findMany({
            where: { id: { in: body.items.map((i) => i.menuItemId) } },
            include: { branchItems: { where: { branchId: body.branchId } } },
        });
        const map = new Map(menuItems.map((m) => [m.id, m]));
        const lines = body.items.map((i) => {
            const mi = map.get(i.menuItemId);
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
    checkout(body) {
        return this.orders.checkout(body);
    }
    order(publicToken) {
        return this.orders.getByPublicToken(publicToken);
    }
    reorder(publicToken, body) {
        return this.orders.reorder(publicToken, body);
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('cafes/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "cafe", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('cafes/:slug/:branchSlug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('branchSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "cafeBranch", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('cafes/:slug/menu'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "menu", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('branches/:branchId/menu'),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "branchMenu", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('qr/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "qr", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('carts/validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "validateCart", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('orders/checkout'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "checkout", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('orders/:publicToken'),
    __param(0, (0, common_1.Param)('publicToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "order", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('orders/:publicToken/reorder'),
    __param(0, (0, common_1.Param)('publicToken')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "reorder", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [homepage_service_1.HomepageService,
        menus_service_1.MenusService,
        tables_service_1.TablesService,
        orders_service_1.OrdersService,
        prisma_service_1.PrismaService,
        pricing_service_1.PricingService])
], PublicController);
//# sourceMappingURL=public.controller.js.map