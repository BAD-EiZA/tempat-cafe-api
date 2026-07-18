import { Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { Public } from '../common/decorators';
import { OutboxWorker } from './outbox.worker';
import { ConfigService } from '@nestjs/config';

@Controller('jobs')
export class OutboxController {
  constructor(
    private readonly worker: OutboxWorker,
    private readonly config: ConfigService,
  ) {}

  /** Cron / serverless: POST /api/v1/jobs/process with x-cron-secret */
  @Public()
  @Post('process')
  async process(@Headers('x-cron-secret') secret?: string) {
    const expected = this.config.get('CRON_SECRET') || 'dev-cron';
    if (secret !== expected) throw new UnauthorizedException('Invalid cron secret');
    await this.worker.processOnce();
    return { ok: true };
  }
}
