import { Module, forwardRef } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { KitchenModule } from '../kitchen/kitchen.module';
import { PaymentsModule } from '../payments/payments.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { TipsModule } from '../tips/tips.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { PromotionsModule } from '../promotions/promotions.module';

@Module({
  imports: [
    forwardRef(() => KitchenModule),
    forwardRef(() => PaymentsModule),
    LoyaltyModule,
    TipsModule,
    VouchersModule,
    PromotionsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
