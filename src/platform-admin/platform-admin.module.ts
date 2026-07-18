import { Module } from '@nestjs/common';
import { PlatformAdminController } from './platform-admin.controller';
import { PlatformAdminService } from './platform-admin.service';
import { LedgerModule } from '../ledger/ledger.module';
import { PayoutsModule } from '../payouts/payouts.module';

@Module({
  imports: [LedgerModule, PayoutsModule],
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService],
})
export class PlatformAdminModule {}
