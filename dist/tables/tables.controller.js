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
exports.TablesController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const tenant_1 = require("../common/tenant");
const tables_service_1 = require("./tables.service");
const prisma_service_1 = require("../prisma/prisma.service");
let TablesController = class TablesController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    async listAreas(user, branchId) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        return this.service.listAreas(branchId);
    }
    async createArea(user, body) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, body.branchId);
        return this.service.createArea(body.branchId, body.name, body.type);
    }
    async listTables(user, branchId) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        return this.service.listTables(branchId);
    }
    async floorMap(user, branchId) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        return this.service.floorMap(branchId);
    }
    async createTable(user, body) {
        await (0, tenant_1.assertBranchAccess)(this.prisma, user, body.branchId);
        return this.service.createTable(body);
    }
    async rotate(user, id) {
        const t = await this.prisma.cafeTable.findUnique({ where: { id } });
        if (t)
            await (0, tenant_1.assertBranchAccess)(this.prisma, user, t.branchId);
        return this.service.rotateQr(id);
    }
    async status(user, id, body) {
        const t = await this.prisma.cafeTable.findUnique({ where: { id } });
        if (t)
            await (0, tenant_1.assertBranchAccess)(this.prisma, user, t.branchId);
        return this.service.updateStatus(id, body.status);
    }
    async position(user, id, body) {
        const t = await this.prisma.cafeTable.findUnique({ where: { id } });
        if (t)
            await (0, tenant_1.assertBranchAccess)(this.prisma, user, t.branchId);
        return this.service.updatePosition(id, Number(body.posX), Number(body.posY));
    }
};
exports.TablesController = TablesController;
__decorate([
    (0, common_1.Get)('areas'),
    (0, decorators_1.RequirePermissions)('table.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "listAreas", null);
__decorate([
    (0, common_1.Post)('areas'),
    (0, decorators_1.RequirePermissions)('table.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "createArea", null);
__decorate([
    (0, common_1.Get)('tables'),
    (0, decorators_1.RequirePermissions)('table.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "listTables", null);
__decorate([
    (0, common_1.Get)('tables/floor-map'),
    (0, decorators_1.RequirePermissions)('table.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "floorMap", null);
__decorate([
    (0, common_1.Post)('tables'),
    (0, decorators_1.RequirePermissions)('table.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "createTable", null);
__decorate([
    (0, common_1.Post)('tables/:id/rotate-qr'),
    (0, decorators_1.RequirePermissions)('table.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "rotate", null);
__decorate([
    (0, common_1.Patch)('tables/:id/status'),
    (0, decorators_1.RequirePermissions)('table.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "status", null);
__decorate([
    (0, common_1.Patch)('tables/:id/position'),
    (0, decorators_1.RequirePermissions)('table.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "position", null);
exports.TablesController = TablesController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [tables_service_1.TablesService,
        prisma_service_1.PrismaService])
], TablesController);
//# sourceMappingURL=tables.controller.js.map