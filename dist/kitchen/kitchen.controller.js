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
exports.KitchenController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const tenant_1 = require("../common/tenant");
const kitchen_service_1 = require("./kitchen.service");
const prisma_service_1 = require("../prisma/prisma.service");
let KitchenController = class KitchenController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    async list(user, branchId, stationId) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        return this.service.listTickets(branchId, stationId);
    }
    async status(user, id, body) {
        const t = await this.prisma.kitchenTicket.findUnique({ where: { id } });
        if (t)
            await (0, tenant_1.assertBranchAccess)(this.prisma, user, t.branchId);
        return this.service.updateTicketStatus(id, body.status);
    }
};
exports.KitchenController = KitchenController;
__decorate([
    (0, common_1.Get)('tickets'),
    (0, decorators_1.RequirePermissions)('kitchen.operate'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('stationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)('tickets/:id/status'),
    (0, decorators_1.RequirePermissions)('kitchen.operate'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "status", null);
exports.KitchenController = KitchenController = __decorate([
    (0, common_1.Controller)('kitchen'),
    __metadata("design:paramtypes", [kitchen_service_1.KitchenService,
        prisma_service_1.PrismaService])
], KitchenController);
//# sourceMappingURL=kitchen.controller.js.map