import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type Tx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async publish(
    eventType: string,
    aggregateType: string,
    aggregateId: string,
    payload: object,
    tx?: Tx,
  ) {
    const client = tx || this.prisma;
    return client.outboxEvent.create({
      data: {
        eventType,
        aggregateType,
        aggregateId,
        payload: payload as Prisma.InputJsonValue,
        status: 'PENDING',
      },
    });
  }

  /** Claim with status flip to avoid multi-instance double process */
  async claimPending(limit = 50) {
    const events = await this.prisma.outboxEvent.findMany({
      where: { status: 'PENDING', availableAt: { lte: new Date() } },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    const claimed: typeof events = [];
    for (const e of events) {
      try {
        const updated = await this.prisma.outboxEvent.updateMany({
          where: { id: e.id, status: 'PENDING' },
          data: { status: 'PROCESSING', attempts: { increment: 1 } },
        });
        if (updated.count === 1) claimed.push(e);
      } catch {
        /* skip race */
      }
    }
    return claimed;
  }

  async markProcessed(id: string) {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });
  }

  async markFailed(id: string, attempts: number) {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: attempts >= 10 ? 'DEAD' : 'PENDING',
        attempts,
        availableAt: new Date(Date.now() + Math.min(attempts, 10) * 30_000),
      },
    });
  }
}
