import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
  ) {}

  activeOrders(branchId: string) {
    return this.prisma.order.findMany({
      where: {
        branchId,
        status: {
          in: ['NEW', 'ACCEPTED', 'PREPARING', 'PARTIALLY_READY', 'READY', 'SERVED', 'AWAITING_PAYMENT'],
        },
      },
      include: { items: true, payments: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  createManual(dto: any) {
    return this.orders.checkout({
      ...dto,
      type: dto.type || 'DINE_IN_POS',
    }, { skipPayment: dto.paymentMethod === 'CASH' });
  }

  openShift(branchId: string, userId: string, openingCash: number) {
    return this.prisma.cashShift.create({
      data: { branchId, openedBy: userId, openingCash },
    });
  }

  async closeShift(id: string, userId: string, actualCash: number, notes?: string) {
    const shift = await this.prisma.cashShift.findUnique({ where: { id } });
    if (!shift) return null;
    // expected = opening + cash sales during shift (skipPayment / CASH)
    const cashOrders = await this.prisma.order.findMany({
      where: {
        branchId: shift.branchId,
        createdAt: { gte: shift.openedAt },
        status: { notIn: ['CANCELLED', 'AWAITING_PAYMENT', 'DRAFT'] },
        type: { in: ['DINE_IN_POS', 'TAKEAWAY_POS'] },
      },
    });
    const cashSales = cashOrders
      .filter((o) => o.status !== 'AWAITING_PAYMENT')
      .reduce((s, o) => s + o.grandTotal, 0);
    const expected = shift.openingCash + cashSales;
    return this.prisma.cashShift.update({
      where: { id },
      data: {
        closedBy: userId,
        closedAt: new Date(),
        actualCash,
        expectedCash: expected,
        variance: actualCash - expected,
        notes,
      },
    });
  }

  mergeSessions(sourceSessionId: string, targetSessionId: string, actorId: string) {
    return this.orders.mergeSessions(sourceSessionId, targetSessionId, actorId);
  }

  listSessions(branchId: string) {
    return this.prisma.tableSession.findMany({
      where: {
        branchId,
        status: { in: ['OPEN', 'ACTIVE', 'CHECKOUT_IN_PROGRESS'] },
      },
      include: { table: true, orders: { take: 5, orderBy: { createdAt: 'desc' } } },
      orderBy: { startedAt: 'desc' },
    });
  }
}
