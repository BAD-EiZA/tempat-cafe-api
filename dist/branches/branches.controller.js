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
exports.BranchesController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const tenant_1 = require("../common/tenant");
const branches_service_1 = require("./branches.service");
const prisma_service_1 = require("../prisma/prisma.service");
let BranchesController = class BranchesController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    list(user, organizationId) {
        const orgId = (0, tenant_1.pickOrgId)(user, organizationId);
        return this.service.list(orgId);
    }
    async get(user, id) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, id);
        return this.service.get(id);
    }
    create(user, body) {
        (0, tenant_1.pickOrgId)(user, body.organizationId);
        return this.service.create(body);
    }
    async update(user, id, body) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, id);
        return this.service.update(id, body);
    }
    async hours(user, id, body) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, id);
        return this.service.setHours(id, body.hours || []);
    }
};
exports.BranchesController = BranchesController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequirePermissions)('merchant.read'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BranchesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, decorators_1.RequirePermissions)('merchant.read'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.RequirePermissions)('branch.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BranchesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, decorators_1.RequirePermissions)('branch.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/hours'),
    (0, decorators_1.RequirePermissions)('branch.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "hours", null);
exports.BranchesController = BranchesController = __decorate([
    (0, common_1.Controller)('branches'),
    __metadata("design:paramtypes", [branches_service_1.BranchesService,
        prisma_service_1.PrismaService])
], BranchesController);
//# sourceMappingURL=branches.controller.js.map