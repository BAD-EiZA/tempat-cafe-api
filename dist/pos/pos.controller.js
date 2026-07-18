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
exports.PosController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const tenant_1 = require("../common/tenant");
const pos_service_1 = require("./pos.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PosController = class PosController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    async active(user, branchId) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        return this.service.activeOrders(branchId);
    }
    async create(user, body) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, body.branchId);
        return this.service.createManual(body);
    }
    async open(body, user) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, body.branchId);
        return this.service.openShift(body.branchId, user.id, body.openingCash);
    }
    close(id, body, user) {
        return this.service.closeShift(id, user.id, body.actualCash, body.notes);
    }
    async sessions(user, branchId) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        return this.service.listSessions(branchId);
    }
    merge(user, body) {
        return this.service.mergeSessions(body.sourceSessionId, body.targetSessionId, user.id);
    }
};
exports.PosController = PosController;
__decorate([
    (0, common_1.Get)('active-orders'),
    (0, decorators_1.RequirePermissions)('pos.operate'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PosController.prototype, "active", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, decorators_1.RequirePermissions)('order.create'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PosController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('shifts/open'),
    (0, decorators_1.RequirePermissions)('pos.operate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PosController.prototype, "open", null);
__decorate([
    (0, common_1.Post)('shifts/:id/close'),
    (0, decorators_1.RequirePermissions)('pos.operate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PosController.prototype, "close", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, decorators_1.RequirePermissions)('pos.operate'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PosController.prototype, "sessions", null);
__decorate([
    (0, common_1.Post)('sessions/merge'),
    (0, decorators_1.RequirePermissions)('pos.operate'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PosController.prototype, "merge", null);
exports.PosController = PosController = __decorate([
    (0, common_1.Controller)('pos'),
    __metadata("design:paramtypes", [pos_service_1.PosService,
        prisma_service_1.PrismaService])
], PosController);
//# sourceMappingURL=pos.controller.js.map