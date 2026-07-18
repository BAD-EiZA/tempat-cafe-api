import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { BranchesModule } from './branches/branches.module';
import { MenusModule } from './menus/menus.module';
import { TablesModule } from './tables/tables.module';
import { TableSessionsModule } from './table-sessions/table-sessions.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { MidtransModule } from './midtrans/midtrans.module';
import { LedgerModule } from './ledger/ledger.module';
import { PayoutsModule } from './payouts/payouts.module';
import { PosModule } from './pos/pos.module';
import { KitchenModule } from './kitchen/kitchen.module';
import { PrintersModule } from './printers/printers.module';
import { ReservationsModule } from './reservations/reservations.module';
import { CustomersModule } from './customers/customers.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { PromotionsModule } from './promotions/promotions.module';
import { TipsModule } from './tips/tips.module';
import { FeedbackModule } from './feedback/feedback.module';
import { HomepageModule } from './homepage/homepage.module';
import { MediaModule } from './media/media.module';
import { ReportsModule } from './reports/reports.module';
import { PlatformAdminModule } from './platform-admin/platform-admin.module';
import { AuditModule } from './audit/audit.module';
import { OutboxModule } from './outbox/outbox.module';
import { PublicModule } from './public/public.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PricingModule } from './pricing/pricing.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HealthModule,
    AuditModule,
    OutboxModule,
    RealtimeModule,
    PricingModule,
    OrganizationsModule,
    BranchesModule,
    MenusModule,
    TablesModule,
    TableSessionsModule,
    OrdersModule,
    PaymentsModule,
    MidtransModule,
    LedgerModule,
    PayoutsModule,
    PosModule,
    KitchenModule,
    PrintersModule,
    ReservationsModule,
    CustomersModule,
    LoyaltyModule,
    VouchersModule,
    PromotionsModule,
    TipsModule,
    FeedbackModule,
    HomepageModule,
    MediaModule,
    ReportsModule,
    PlatformAdminModule,
    PublicModule,
    NotificationsModule,
  ],
})
export class AppModule {}
