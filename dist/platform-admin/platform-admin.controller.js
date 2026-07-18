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
exports.PlatformAdminController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const platform_admin_service_1 = require("./platform-admin.service");
const payouts_service_1 = require("../payouts/payouts.service");
let PlatformAdminController = class PlatformAdminController {
    constructor(service, payouts) {
        this.service = service;
        this.payouts = payouts;
    }
    merchants(q) {
        return this.service.listMerchants(q);
    }
    status(id, body, user) {
        return this.service.setMerchantStatus(id, body.status, user.id, body.reason);
    }
    payments() {
        return this.service.listPayments();
    }
    recon() {
        return this.service.listReconciliation();
    }
    runRecon() {
        return this.service.runReconciliation();
    }
    audit(organizationId) {
        return this.service.listAudit(organizationId);
    }
    metrics() {
        return this.service.platformMetrics();
    }
    createPayout(body, user) {
        return this.payouts.createBatch(body.organizationId, body.amount, user);
    }
    approve(id, user) {
        return this.payouts.approve(id, user);
    }
    adjust(body, user) {
        return this.service.adjustLedger(body.organizationId, body.amount, body.reason, user.id);
    }
    impersonate(organizationId, user) {
        return this.service.impersonate(organizationId, user.id);
    }
    submitPayout(id, user) {
        return this.payouts.submitApproval(id, user);
    }
};
exports.PlatformAdminController = PlatformAdminController;
__decorate([
    (0, common_1.Get)('merchants'),
    (0, decorators_1.RequirePermissions)('platform.admin'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformAdminController.prototype, "merchants", null);
__decorate([
    (0, common_1.Patch)('merchants/:id/status'),
    (0, decorators_1.RequirePermissions)('platform.admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PlatformAdminController.prototype, "status", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, decorators_1.RequirePermissions)('platform.admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformAdminController.prototype, "payments", null);
__decorate([
    (0, common_1.Get)('reconciliation'),
    (0, decorators_1.RequirePermissions)('platform.admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformAdminController.prototype, "recon", null);
__decorate([
    (0, common_1.Post)('reconciliation/run'),
    (0, decorators_1.RequirePermissions)('platform.admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformAdminController.prototype, "runRecon", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, decorators_1.RequirePermissions)('platform.admin'),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformAdminController.prototype, "audit", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, decorators_1.RequirePermissions)('platform.admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformAdminController.prototype, "metrics", null);
__decorate([
    (0, common_1.Post)('payout-batches'),
    (0, decorators_1.RequirePermissions)('payout.manage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PlatformAdminController.prototype, "createPayout", null);
__decorate([
    (0, common_1.Post)('payout-batches/:id/approve'),
    (0, decorators_1.RequirePermissions)('payout.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PlatformAdminController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('ledger-adjustments'),
    (0, decorators_1.RequirePermissions)('ledger.adjust'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PlatformAdminController.prototype, "adjust", null);
__decorate([
    (0, common_1.Post)('impersonate/:organizationId'),
    (0, decorators_1.RequirePermissions)('platform.admin'),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PlatformAdminController.prototype, "impersonate", null);
__decorate([
    (0, common_1.Post)('payout-batches/:id/submit'),
    (0, decorators_1.RequirePermissions)('payout.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PlatformAdminController.prototype, "submitPayout", null);
exports.PlatformAdminController = PlatformAdminController = __decorate([
    (0, common_1.Controller)('platform'),
    __metadata("design:paramtypes", [platform_admin_service_1.PlatformAdminService,
        payouts_service_1.PayoutsService])
], PlatformAdminController);
//# sourceMappingURL=platform-admin.controller.js.map