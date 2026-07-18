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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const decorators_1 = require("../common/decorators");
const tenant_1 = require("../common/tenant");
const orders_service_1 = require("./orders.service");
const prisma_service_1 = require("../prisma/prisma.service");
const common_2 = require("@nestjs/common");
let OrdersController = class OrdersController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    async assertOrderAccess(user, orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_2.ForbiddenException('Order not found');
        if (!(0, tenant_1.isPlatformAdmin)(user))
            (0, tenant_1.assertOrgAccess)(user, order.organizationId);
        return order;
    }
    list(user, branchId, status, organizationId) {
        const orgId = organizationId || user.organizationIds[0];
        if (orgId)
            (0, tenant_1.assertOrgAccess)(user, orgId);
        return this.service.list({
            branchId,
            status,
            organizationId: (0, tenant_1.isPlatformAdmin)(user) ? organizationId : orgId,
        });
    }
    async get(user, id) {
        await this.assertOrderAccess(user, id);
        return this.service.get(id);
    }
    async status(id, body, user) {
        await this.assertOrderAccess(user, id);
        return this.service.updateStatus(id, body.status, user.id, body.reason);
    }
    async voidItem(user, id, body) {
        await this.assertOrderAccess(user, id);
        return this.service.voidItem(id, body.orderItemId, user.id, body.reason);
    }
    async transfer(user, id, body) {
        await this.assertOrderAccess(user, id);
        return this.service.transferTable(id, body.tableId, user.id);
    }
    async reprint(user, id) {
        await this.assertOrderAccess(user, id);
        return this.service.reprint(id);
    }
    checkout(body) {
        return this.service.checkout(body);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequirePermissions)('pos.operate'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, decorators_1.RequirePermissions)('pos.operate'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, decorators_1.RequirePermissions)('order.accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "status", null);
__decorate([
    (0, common_1.Post)(':id/void-item'),
    (0, decorators_1.RequirePermissions)('order.cancel'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "voidItem", null);
__decorate([
    (0, common_1.Post)(':id/transfer-table'),
    (0, decorators_1.RequirePermissions)('pos.operate'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "transfer", null);
__decorate([
    (0, common_1.Post)(':id/reprint'),
    (0, decorators_1.RequirePermissions)('pos.operate'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "reprint", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "checkout", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        prisma_service_1.PrismaService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map