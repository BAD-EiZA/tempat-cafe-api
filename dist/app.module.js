"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const health_module_1 = require("./health/health.module");
const organizations_module_1 = require("./organizations/organizations.module");
const branches_module_1 = require("./branches/branches.module");
const menus_module_1 = require("./menus/menus.module");
const tables_module_1 = require("./tables/tables.module");
const table_sessions_module_1 = require("./table-sessions/table-sessions.module");
const orders_module_1 = require("./orders/orders.module");
const payments_module_1 = require("./payments/payments.module");
const midtrans_module_1 = require("./midtrans/midtrans.module");
const ledger_module_1 = require("./ledger/ledger.module");
const payouts_module_1 = require("./payouts/payouts.module");
const pos_module_1 = require("./pos/pos.module");
const kitchen_module_1 = require("./kitchen/kitchen.module");
const printers_module_1 = require("./printers/printers.module");
const reservations_module_1 = require("./reservations/reservations.module");
const customers_module_1 = require("./customers/customers.module");
const loyalty_module_1 = require("./loyalty/loyalty.module");
const vouchers_module_1 = require("./vouchers/vouchers.module");
const promotions_module_1 = require("./promotions/promotions.module");
const tips_module_1 = require("./tips/tips.module");
const feedback_module_1 = require("./feedback/feedback.module");
const homepage_module_1 = require("./homepage/homepage.module");
const media_module_1 = require("./media/media.module");
const reports_module_1 = require("./reports/reports.module");
const platform_admin_module_1 = require("./platform-admin/platform-admin.module");
const audit_module_1 = require("./audit/audit.module");
const outbox_module_1 = require("./outbox/outbox.module");
const public_module_1 = require("./public/public.module");
const notifications_module_1 = require("./notifications/notifications.module");
const pricing_module_1 = require("./pricing/pricing.module");
const realtime_module_1 = require("./realtime/realtime.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            health_module_1.HealthModule,
            audit_module_1.AuditModule,
            outbox_module_1.OutboxModule,
            realtime_module_1.RealtimeModule,
            pricing_module_1.PricingModule,
            organizations_module_1.OrganizationsModule,
            branches_module_1.BranchesModule,
            menus_module_1.MenusModule,
            tables_module_1.TablesModule,
            table_sessions_module_1.TableSessionsModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            midtrans_module_1.MidtransModule,
            ledger_module_1.LedgerModule,
            payouts_module_1.PayoutsModule,
            pos_module_1.PosModule,
            kitchen_module_1.KitchenModule,
            printers_module_1.PrintersModule,
            reservations_module_1.ReservationsModule,
            customers_module_1.CustomersModule,
            loyalty_module_1.LoyaltyModule,
            vouchers_module_1.VouchersModule,
            promotions_module_1.PromotionsModule,
            tips_module_1.TipsModule,
            feedback_module_1.FeedbackModule,
            homepage_module_1.HomepageModule,
            media_module_1.MediaModule,
            reports_module_1.ReportsModule,
            platform_admin_module_1.PlatformAdminModule,
            public_module_1.PublicModule,
            notifications_module_1.NotificationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map