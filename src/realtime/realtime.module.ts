import { Global, Module } from '@nestjs/common';
import { RealtimeHub } from './realtime.hub';
import { RealtimeController } from './realtime.controller';

@Global()
@Module({
  controllers: [RealtimeController],
  providers: [RealtimeHub],
  exports: [RealtimeHub],
})
export class RealtimeModule {}
