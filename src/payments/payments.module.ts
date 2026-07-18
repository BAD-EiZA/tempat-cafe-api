import { Module, forwardRef } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MidtransModule } from '../midtrans/midtrans.module';
import { OrdersModule } from '../orders/orders.module';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [
    MidtransModule,
    forwardRef(() => OrdersModule),
    LedgerModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
