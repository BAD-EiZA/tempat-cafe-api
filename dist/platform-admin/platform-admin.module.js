"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAdminModule = void 0;
const common_1 = require("@nestjs/common");
const platform_admin_controller_1 = require("./platform-admin.controller");
const platform_admin_service_1 = require("./platform-admin.service");
const ledger_module_1 = require("../ledger/ledger.module");
const payouts_module_1 = require("../payouts/payouts.module");
let PlatformAdminModule = class PlatformAdminModule {
};
exports.PlatformAdminModule = PlatformAdminModule;
exports.PlatformAdminModule = PlatformAdminModule = __decorate([
    (0, common_1.Module)({
        imports: [ledger_module_1.LedgerModule, payouts_module_1.PayoutsModule],
        controllers: [platform_admin_controller_1.PlatformAdminController],
        providers: [platform_admin_service_1.PlatformAdminService],
    })
], PlatformAdminModule);
//# sourceMappingURL=platform-admin.module.js.map