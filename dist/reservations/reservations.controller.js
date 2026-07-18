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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const tenant_1 = require("../common/tenant");
const reservations_service_1 = require("./reservations.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ReservationsController = class ReservationsController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    availability(body) {
        return this.service.availability(body.branchId, new Date(body.startAt), body.guestCount);
    }
    createPublic(body) {
        return this.service.create(body);
    }
    async list(user, branchId, from, to) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        return this.service.list(branchId, from, to);
    }
    async status(id, body, user) {
        const r = await this.prisma.reservation.findUnique({ where: { id } });
        if (r)
            await (0, tenant_1.assertBranchAccess)(this.prisma, user, r.branchId);
        return this.service.updateStatus(id, body.status, user.id);
    }
    async settings(user, body) {
        const { branchId, ...rest } = body;
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        return this.service.updateSettings(branchId, rest);
    }
    async confirmDeposit(user, id) {
        const r = await this.prisma.reservation.findUnique({ where: { id } });
        if (r)
            await (0, tenant_1.assertBranchAccess)(this.prisma, user, r.branchId);
        return this.service.confirmDeposit(id, user.id);
    }
    async noShow(user, id) {
        const r = await this.prisma.reservation.findUnique({ where: { id } });
        if (r)
            await (0, tenant_1.assertBranchAccess)(this.prisma, user, r.branchId);
        return this.service.updateStatus(id, 'NO_SHOW', user.id);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('public/reservations/availability'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "availability", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('public/reservations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "createPublic", null);
__decorate([
    (0, common_1.Get)('reservations'),
    (0, decorators_1.RequirePermissions)('reservation.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)('reservations/:id/status'),
    (0, decorators_1.RequirePermissions)('reservation.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "status", null);
__decorate([
    (0, common_1.Post)('reservations/settings'),
    (0, decorators_1.RequirePermissions)('reservation.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "settings", null);
__decorate([
    (0, common_1.Post)('reservations/:id/confirm-deposit'),
    (0, decorators_1.RequirePermissions)('reservation.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "confirmDeposit", null);
__decorate([
    (0, common_1.Post)('reservations/:id/no-show'),
    (0, decorators_1.RequirePermissions)('reservation.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "noShow", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService,
        prisma_service_1.PrismaService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map