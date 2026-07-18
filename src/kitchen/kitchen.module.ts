import { Module, forwardRef } from '@nestjs/common';
import { KitchenController } from './kitchen.controller';
import { KitchenService } from './kitchen.service';
import { PrintersModule } from '../printers/printers.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [forwardRef(() => PrintersModule), forwardRef(() => OrdersModule)],
  controllers: [KitchenController],
  providers: [KitchenService],
  exports: [KitchenService],
})
export class KitchenModule {}
