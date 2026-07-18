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
exports.HomepageController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const tenant_1 = require("../common/tenant");
const homepage_service_1 = require("./homepage.service");
const prisma_service_1 = require("../prisma/prisma.service");
const common_2 = require("@nestjs/common");
let HomepageController = class HomepageController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    async assertPageAccess(user, pageId) {
        const page = await this.prisma.homepagePage.findUnique({ where: { id: pageId } });
        if (!page)
            throw new common_2.NotFoundException('Homepage not found');
        (0, tenant_1.assertOrgAccess)(user, page.organizationId);
    }
    list(user, organizationId) {
        return this.service.list((0, tenant_1.pickOrgId)(user, organizationId));
    }
    create(user, body) {
        body.organizationId = (0, tenant_1.pickOrgId)(user, body.organizationId);
        return this.service.createPage(body);
    }
    async draft(user, id, body) {
        await this.assertPageAccess(user, id);
        return this.service.updateDraft(id, body);
    }
    async publish(user, id) {
        await this.assertPageAccess(user, id);
        return this.service.publish(id);
    }
};
exports.HomepageController = HomepageController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequirePermissions)('homepage.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HomepageController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.RequirePermissions)('homepage.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], HomepageController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/draft'),
    (0, decorators_1.RequirePermissions)('homepage.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], HomepageController.prototype, "draft", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, decorators_1.RequirePermissions)('homepage.manage'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HomepageController.prototype, "publish", null);
exports.HomepageController = HomepageController = __decorate([
    (0, common_1.Controller)('homepage'),
    __metadata("design:paramtypes", [homepage_service_1.HomepageService, prisma_service_1.PrismaService])
], HomepageController);
//# sourceMappingURL=homepage.controller.js.map