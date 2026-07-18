"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicModule = void 0;
const common_1 = require("@nestjs/common");
const public_controller_1 = require("./public.controller");
const tables_module_1 = require("../tables/tables.module");
const menus_module_1 = require("../menus/menus.module");
const homepage_module_1 = require("../homepage/homepage.module");
const orders_module_1 = require("../orders/orders.module");
const pricing_module_1 = require("../pricing/pricing.module");
let PublicModule = class PublicModule {
};
exports.PublicModule = PublicModule;
exports.PublicModule = PublicModule = __decorate([
    (0, common_1.Module)({
        imports: [tables_module_1.TablesModule, menus_module_1.MenusModule, homepage_module_1.HomepageModule, orders_module_1.OrdersModule, pricing_module_1.PricingModule],
        controllers: [public_controller_1.PublicController],
    })
], PublicModule);
//# sourceMappingURL=public.module.js.map