import { OutboxWorker } from './outbox.worker';
import { ConfigService } from '@nestjs/config';
export declare class OutboxController {
    private readonly worker;
    private readonly config;
    constructor(worker: OutboxWorker, config: ConfigService);
    process(secret?: string, authorization?: string): Promise<{
        ok: boolean;
    }>;
}
