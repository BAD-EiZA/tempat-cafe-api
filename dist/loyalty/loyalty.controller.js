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
exports.LoyaltyController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const loyalty_service_1 = require("./loyalty.service");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_1 = require("../common/tenant");
const common_2 = require("@nestjs/common");
let LoyaltyController = class LoyaltyController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    async assertAccountAccess(user, accountId) {
        const account = await this.prisma.loyaltyAccount.findUnique({ where: { id: accountId } });
        if (!account)
            throw new common_2.NotFoundException('Loyalty account not found');
        (0, tenant_1.assertOrgAccess)(user, account.organizationId);
        return account;
    }
    async get(user, id) {
        await this.assertAccountAccess(user, id);
        return this.service.getAccount(id);
    }
    async lookup(organizationId, phone, customerId) {
        if (!organizationId)
            return null;
        let cid = customerId;
        if (!cid && phone) {
            const c = await this.service.findCustomerByPhone(phone, organizationId);
            cid = c?.id;
        }
        if (!cid)
            return { balance: 0 };
        const acc = await this.service.findAccount(cid, organizationId);
        const discountPerPoint = await this.service.quoteRedeemDiscount(organizationId, 1);
        return {
            customerId: cid,
            accountId: acc?.id,
            balance: acc?.balance ?? 0,
            discountPerPoint,
        };
    }
    adjust(body) {
        return this.service.adjust(body.accountId, body.points, body.reason);
    }
    redeem(body) {
        return this.service.redeem(body.accountId, body.points, body.orderId);
    }
};
exports.LoyaltyController = LoyaltyController;
__decorate([
    (0, common_1.Get)('accounts/:id'),
    (0, decorators_1.RequirePermissions)('merchant.read'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "get", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('lookup'),
    __param(0, (0, common_1.Query)('organizationId')),
    __param(1, (0, common_1.Query)('phone')),
    __param(2, (0, common_1.Query)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "lookup", null);
__decorate([
    (0, common_1.Post)('adjustments'),
    (0, decorators_1.RequirePermissions)('loyalty.adjust'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LoyaltyController.prototype, "adjust", null);
__decorate([
    (0, common_1.Post)('redeem'),
    (0, decorators_1.RequirePermissions)('loyalty.adjust'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LoyaltyController.prototype, "redeem", null);
exports.LoyaltyController = LoyaltyController = __decorate([
    (0, common_1.Controller)('loyalty'),
    __metadata("design:paramtypes", [loyalty_service_1.LoyaltyService,
        prisma_service_1.PrismaService])
], LoyaltyController);
//# sourceMappingURL=loyalty.controller.js.map