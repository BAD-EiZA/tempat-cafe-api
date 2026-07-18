import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { TablesModule } from '../tables/tables.module';
import { MenusModule } from '../menus/menus.module';
import { HomepageModule } from '../homepage/homepage.module';
import { OrdersModule } from '../orders/orders.module';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [TablesModule, MenusModule, HomepageModule, OrdersModule, PricingModule],
  controllers: [PublicController],
})
export class PublicModule {}
