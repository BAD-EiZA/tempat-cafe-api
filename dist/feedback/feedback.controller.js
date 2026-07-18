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
exports.FeedbackController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const tenant_1 = require("../common/tenant");
const feedback_service_1 = require("./feedback.service");
const prisma_service_1 = require("../prisma/prisma.service");
const common_2 = require("@nestjs/common");
let FeedbackController = class FeedbackController {
    constructor(service, prisma) {
        this.service = service;
        this.prisma = prisma;
    }
    create(body) {
        return this.service.create(body);
    }
    createByToken(body) {
        if (body.publicToken)
            return this.service.createFromToken(body.publicToken, body);
        return this.service.create(body);
    }
    list(user, organizationId, branchId) {
        return this.service.list((0, tenant_1.pickOrgId)(user, organizationId), branchId);
    }
    async respond(id, body, user) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { id },
            select: { order: { select: { organizationId: true } } },
        });
        if (!feedback)
            throw new common_2.NotFoundException('Feedback not found');
        (0, tenant_1.assertOrgAccess)(user, feedback.order.organizationId);
        return this.service.respond(id, body.message, user.id);
    }
};
exports.FeedbackController = FeedbackController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "create", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('by-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "createByToken", null);
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequirePermissions)('feedback.respond'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('organizationId')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':id/respond'),
    (0, decorators_1.RequirePermissions)('feedback.respond'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FeedbackController.prototype, "respond", null);
exports.FeedbackController = FeedbackController = __decorate([
    (0, common_1.Controller)('feedback'),
    __metadata("design:paramtypes", [feedback_service_1.FeedbackService, prisma_service_1.PrismaService])
], FeedbackController);
//# sourceMappingURL=feedback.controller.js.map