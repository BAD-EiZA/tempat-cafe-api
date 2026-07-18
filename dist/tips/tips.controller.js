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
exports.TipsController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const tenant_1 = require("../common/tenant");
const tips_service_1 = require("./tips.service");
const prisma_service_1 = require("../prisma/prisma.service");
let TipsController = class TipsController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    async list(user, branchId) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        return this.service.listByBranch(branchId);
    }
    allocate(id, body) {
        return this.service.allocateToStaff(id, body.splits || []);
    }
};
exports.TipsController = TipsController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequirePermissions)('merchant.read'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TipsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':id/allocate'),
    (0, decorators_1.RequirePermissions)('merchant.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TipsController.prototype, "allocate", null);
exports.TipsController = TipsController = __decorate([
    (0, common_1.Controller)('tips'),
    __metadata("design:paramtypes", [tips_service_1.TipsService,
        prisma_service_1.PrismaService])
], TipsController);
//# sourceMappingURL=tips.controller.js.map