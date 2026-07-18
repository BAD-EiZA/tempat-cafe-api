import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OutboxService } from '../outbox/outbox.service';

@Injectable()
export class TableSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async open(dto: {
    branchId: string;
    tableId: string;
    displayName?: string;
    customerId?: string;
    joinExisting?: boolean;
  }) {
    const table = await this.prisma.cafeTable.findUnique({ where: { id: dto.tableId } });
    if (!table || table.branchId !== dto.branchId) {
      throw new NotFoundException('Table not found');
    }

    const existing = await this.prisma.tableSession.findFirst({
      where: {
        tableId: dto.tableId,
        status: { in: ['OPEN', 'ACTIVE', 'CHECKOUT_IN_PROGRESS'] },
      },
    });

    if (existing) {
      if (dto.joinExisting !== false) {
        await this.prisma.tableSessionParticipant.create({
          data: {
            tableSessionId: existing.id,
            customerId: dto.customerId,
            displayName: dto.displayName,
          },
        });
        return this.prisma.tableSession.findUnique({
          where: { id: existing.id },
          include: { participants: true, table: true },
        });
      }
      throw new BadRequestException('Active session exists');
    }

    const session = await this.prisma.$transaction(async (tx) => {
      const s = await tx.tableSession.create({
        data: {
          branchId: dto.branchId,
          tableId: dto.tableId,
          status: 'OPEN',
          customerInitiatorId: dto.customerId,
          participants: {
            create: {
              customerId: dto.customerId,
              displayName: dto.displayName || 'Guest',
            },
          },
        },
        include: { participants: true, table: true },
      });
      await tx.cafeTable.update({
        where: { id: dto.tableId },
        data: { status: 'OCCUPIED' },
      });
      await this.outbox.publish(
        'TABLE_SESSION_OPENED',
        'table_session',
        s.id,
        { sessionId: s.id, tableId: dto.tableId, branchId: dto.branchId },
        tx as any,
      );
      return s;
    });

    return session;
  }

  async get(id: string) {
    const s = await this.prisma.tableSession.findUnique({
      where: { id },
      include: {
        participants: true,
        table: true,
        orders: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!s) throw new NotFoundException();
    return s;
  }

  async close(id: string) {
    const s = await this.prisma.tableSession.findUnique({
      where: { id },
      include: { orders: true },
    });
    if (!s) throw new NotFoundException();
    const openOrders = s.orders.filter(
      (o) => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status),
    );
    if (openOrders.length) {
      throw new BadRequestException('Open orders remain');
    }
    return this.prisma.$transaction(async (tx) => {
      const closed = await tx.tableSession.update({
        where: { id },
        data: { status: 'CLOSED', closedAt: new Date() },
      });
      await tx.cafeTable.update({
        where: { id: s.tableId },
        data: { status: 'NEEDS_CLEANING' },
      });
      return closed;
    });
  }
}
