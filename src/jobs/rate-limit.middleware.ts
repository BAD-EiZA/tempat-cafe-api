import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

const buckets = new Map<string, { count: number; reset: number }>();

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';
    const path = req.url || '';
    const key = `${ip}:${path.split('?')[0]}`;
    const now = Date.now();
    const windowMs = 60_000;
    const max = path.includes('/public/') || path.includes('/webhooks/') ? 120 : 300;
    let b = buckets.get(key);
    if (!b || b.reset < now) {
      b = { count: 0, reset: now + windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    if (b.count > max) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    next();
  }
}
