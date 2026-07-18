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
exports.PayoutsController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const payouts_service_1 = require("./payouts.service");
let PayoutsController = class PayoutsController {
    constructor(service) {
        this.service = service;
    }
    list(user, organizationId) {
        return this.service.list(user, organizationId);
    }
    create(body, user) {
        return this.service.createBatch(body.organizationId, body.amount, user);
    }
    submit(id, user) {
        return this.service.submitApproval(id, user);
    }
    approve(id, user) {
        return this.service.approve(id, user);
    }
};
exports.PayoutsController = PayoutsController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequirePermissions)('payout.view'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.RequirePermissions)('payout.manage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, decorators_1.RequirePermissions)('payout.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, decorators_1.RequirePermissions)('payout.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "approve", null);
exports.PayoutsController = PayoutsController = __decorate([
    (0, common_1.Controller)('payouts'),
    __metadata("design:paramtypes", [payouts_service_1.PayoutsService])
], PayoutsController);
//# sourceMappingURL=payouts.controller.js.map