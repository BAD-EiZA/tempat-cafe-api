import { Global, Module, forwardRef } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { OutboxWorker } from './outbox.worker';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { LedgerModule } from '../ledger/ledger.module';
import { OutboxController } from './outbox.controller';

@Global()
@Module({
  imports: [NotificationsModule, forwardRef(() => OrdersModule), LedgerModule],
  controllers: [OutboxController],
  providers: [OutboxService, OutboxWorker],
  exports: [OutboxService, OutboxWorker],
})
export class OutboxModule {}
