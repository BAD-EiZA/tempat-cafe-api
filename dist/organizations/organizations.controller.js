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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const tenant_1 = require("../common/tenant");
const organizations_service_1 = require("./organizations.service");
let OrganizationsController = class OrganizationsController {
    constructor(service) {
        this.service = service;
    }
    list(user) {
        return this.service.listForUser(user.id);
    }
    create(user, body) {
        return this.service.create(user.id, body);
    }
    get(id, user) {
        (0, tenant_1.assertOrgAccess)(user, id);
        return this.service.get(id);
    }
    update(id, user, body) {
        (0, tenant_1.assertOrgAccess)(user, id);
        return this.service.update(id, user.id, body);
    }
    submit(id, user) {
        (0, tenant_1.assertOrgAccess)(user, id);
        return this.service.submitOnboarding(id, user.id);
    }
    payout(id, user, body) {
        (0, tenant_1.assertOrgAccess)(user, id);
        return this.service.setPayoutAccount(id, user.id, body);
    }
    members(id, user) {
        (0, tenant_1.assertOrgAccess)(user, id);
        return this.service.listMembers(id);
    }
    invite(id, user, body) {
        (0, tenant_1.assertOrgAccess)(user, id);
        return this.service.inviteMember(id, user.id, body);
    }
    remove(id, userId, user) {
        (0, tenant_1.assertOrgAccess)(user, id);
        return this.service.removeMember(id, userId, user.id);
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, decorators_1.RequirePermissions)('merchant.read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, decorators_1.RequirePermissions)('merchant.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, decorators_1.RequirePermissions)('merchant.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/payout-accounts'),
    (0, decorators_1.RequirePermissions)('merchant.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "payout", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    (0, decorators_1.RequirePermissions)('merchant.read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "members", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    (0, decorators_1.RequirePermissions)('merchant.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "invite", null);
__decorate([
    (0, common_1.Post)(':id/members/:userId/remove'),
    (0, decorators_1.RequirePermissions)('merchant.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "remove", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, common_1.Controller)('organizations'),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map