import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async sales(organizationId: string, branchId?: string, from?: string, to?: string) {
    const where: any = {
      organizationId,
      status: { in: ['NEW', 'ACCEPTED', 'PREPARING', 'PARTIALLY_READY', 'READY', 'SERVED', 'COMPLETED'] },
    };
    if (branchId) where.branchId = branchId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: { items: true, payments: true },
    });

    const grossSales = orders.reduce((s, o) => s + o.grandTotal, 0);
    const netSales = orders.reduce((s, o) => s + (o.subtotal - o.discountTotal), 0);
    const orderCount = orders.length;
    const aov = orderCount ? Math.floor(grossSales / orderCount) : 0;
    const taxTotal = orders.reduce((s, o) => s + o.taxTotal, 0);
    const tipTotal = orders.reduce((s, o) => s + o.tipTotal, 0);
    const discountTotal = orders.reduce((s, o) => s + o.discountTotal, 0);
    const refundCount = await this.prisma.order.count({
      where: { ...where, status: 'REFUNDED' },
    });

    const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of orders) {
      for (const i of o.items) {
        const cur = productMap.get(i.nameSnapshot) || { name: i.nameSnapshot, qty: 0, revenue: 0 };
        cur.qty += i.quantity;
        cur.revenue += i.lineTotal;
        productMap.set(i.nameSnapshot, cur);
      }
    }
    const topProducts = [...productMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 20);

    const hourMap = new Map<number, number>();
    for (const o of orders) {
      const h = o.createdAt.getHours();
      hourMap.set(h, (hourMap.get(h) || 0) + o.grandTotal);
    }
    const byHour = [...hourMap.entries()]
      .map(([hour, total]) => ({ hour, total }))
      .sort((a, b) => a.hour - b.hour);

    return {
      grossSales,
      netSales,
      orderCount,
      averageOrderValue: aov,
      taxTotal,
      tipTotal,
      discountTotal,
      refundCount,
      topProducts,
      byHour,
    };
  }

  async operations(branchId: string, from?: string, to?: string) {
    const ticketWhere: any = { branchId };
    if (from || to) {
      ticketWhere.queuedAt = {};
      if (from) ticketWhere.queuedAt.gte = new Date(from);
      if (to) ticketWhere.queuedAt.lte = new Date(to);
    }
    const tickets = await this.prisma.kitchenTicket.findMany({ where: ticketWhere });
    const ready = tickets.filter((t) => t.readyAt);
    const avgMs =
      ready.length === 0
        ? 0
        : ready.reduce((s, t) => s + (t.readyAt!.getTime() - t.queuedAt.getTime()), 0) /
          ready.length;

    const reservations = await this.prisma.reservation.groupBy({
      by: ['status'],
      where: { branchId },
      _count: true,
    });

    const feedback = await this.prisma.feedback.aggregate({
      where: { order: { branchId } },
      _avg: { overallRating: true },
      _count: true,
    });

    return {
      ticketCount: tickets.length,
      avgProductionMinutes: Math.round((avgMs / 60_000) * 10) / 10,
      reservations,
      feedback: {
        count: feedback._count,
        avgRating: feedback._avg.overallRating,
      },
    };
  }
}
