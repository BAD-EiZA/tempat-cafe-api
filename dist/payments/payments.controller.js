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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const payments_service_1 = require("./payments.service");
const config_1 = require("@nestjs/config");
const tenant_1 = require("../common/tenant");
const prisma_service_1 = require("../prisma/prisma.service");
const common_2 = require("@nestjs/common");
let PaymentsController = class PaymentsController {
    constructor(service, config, prisma) {
        this.service = service;
        this.config = config;
        this.prisma = prisma;
    }
    async snap(orderId, body, qToken, user) {
        await this.service.assertPaymentAccess(orderId, body?.publicToken || qToken, user);
        return this.service.createSnapForOrder(orderId);
    }
    webhook(body) {
        return this.service.handleMidtransWebhook(body);
    }
    async status(paymentId, publicToken, user) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { order: true },
        });
        if (!payment)
            throw new common_2.ForbiddenException();
        await this.service.assertPaymentAccess(payment.orderId, publicToken, user);
        return this.service.getStatus(paymentId);
    }
    async mockPay(paymentId, body, qToken, user) {
        if (this.config.get('NODE_ENV') === 'production') {
            throw new common_1.BadRequestException('Mock pay disabled');
        }
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment)
            throw new common_2.ForbiddenException();
        await this.service.assertPaymentAccess(payment.orderId, body?.publicToken || qToken, user);
        return this.service.mockPay(paymentId);
    }
    async refund(paymentId, body, user) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment)
            throw new common_2.ForbiddenException();
        if (!(0, tenant_1.isPlatformAdmin)(user))
            (0, tenant_1.assertOrgAccess)(user, payment.organizationId);
        return this.service.requestRefund(paymentId, body.amount, body.reason, user.id, body.idempotencyKey);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('payments/:orderId/snap-token'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('publicToken')),
    __param(3, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "snap", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('webhooks/midtrans'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "webhook", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('payments/:paymentId/status'),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Query)('publicToken')),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "status", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('payments/:paymentId/mock-pay'),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('publicToken')),
    __param(3, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "mockPay", null);
__decorate([
    (0, common_1.Post)('payments/:paymentId/refunds'),
    (0, decorators_1.RequirePermissions)('payment.refund.request'),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refund", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map