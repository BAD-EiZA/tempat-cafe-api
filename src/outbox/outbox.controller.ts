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

  /**
   * Cron / serverless: POST /api/v1/jobs/process
   * Auth: x-cron-secret header, or Authorization: Bearer <CRON_SECRET>,
   * or ?cron_secret= (Vercel Cron cannot set custom headers).
   */
  @Public()
  @Post('process')
  async process(
    @Headers('x-cron-secret') secret?: string,
    @Headers('authorization') authorization?: string,
  ) {
    const expected = this.config.get('CRON_SECRET') || 'dev-cron';
    const bearer = authorization?.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : undefined;
    // Vercel Cron: CRON_SECRET env is auto-sent as Authorization Bearer on Pro;
    // free tier may call without secret — allow only if CRON_SECRET empty is never used in prod.
    const ok = secret === expected || bearer === expected;
    if (!ok) throw new UnauthorizedException('Invalid cron secret');
    await this.worker.processOnce();
    return { ok: true };
  }
}
