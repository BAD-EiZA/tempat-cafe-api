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
exports.PrintersController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const tenant_1 = require("../common/tenant");
const printers_service_1 = require("./printers.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PrintersController = class PrintersController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    async create(user, body) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, body.branchId);
        return this.service.createDevice(body);
    }
    async list(user, branchId) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        return this.service.listDevices(branchId);
    }
    map(body) {
        return this.service.mapStation(body.printerId, body.stationId, true, body.copies);
    }
    async register(user, body) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, body.branchId);
        return this.service.registerAgent(body.branchId, body.name);
    }
    heartbeat(token) {
        return this.service.heartbeat(token);
    }
    next(token) {
        return this.service.nextJob(token);
    }
    ack(id, token) {
        return this.service.ack(id, token);
    }
    fail(id, token, body) {
        return this.service.fail(id, token, body.error);
    }
    retry(id) {
        return this.service.retry(id);
    }
    async agents(user, branchId) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        return this.service.listAgents(branchId);
    }
};
exports.PrintersController = PrintersController;
__decorate([
    (0, common_1.Post)('printers'),
    (0, decorators_1.RequirePermissions)('printer.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PrintersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('printers'),
    (0, decorators_1.RequirePermissions)('printer.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PrintersController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('printers/map-station'),
    (0, decorators_1.RequirePermissions)('printer.manage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "map", null);
__decorate([
    (0, common_1.Post)('printers/agents/register'),
    (0, decorators_1.RequirePermissions)('printer.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PrintersController.prototype, "register", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('printers/agents/heartbeat'),
    __param(0, (0, common_1.Headers)('x-device-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "heartbeat", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('printers/jobs/next'),
    __param(0, (0, common_1.Headers)('x-device-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "next", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('printers/jobs/:id/ack'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-device-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "ack", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('printers/jobs/:id/fail'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-device-token')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "fail", null);
__decorate([
    (0, common_1.Post)('print-jobs/:id/retry'),
    (0, decorators_1.RequirePermissions)('printer.manage'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "retry", null);
__decorate([
    (0, common_1.Get)('printers/agents'),
    (0, decorators_1.RequirePermissions)('printer.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PrintersController.prototype, "agents", null);
exports.PrintersController = PrintersController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [printers_service_1.PrintersService,
        prisma_service_1.PrismaService])
], PrintersController);
//# sourceMappingURL=printers.controller.js.map