import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { OrderStatus, OrderType, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { OutboxService } from '../outbox/outbox.service';
import { KitchenService } from '../kitchen/kitchen.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { PromotionsService } from '../promotions/promotions.service';
import { TipsService } from '../tips/tips.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PaymentsService } from '../payments/payments.service';
import { checkoutInputError } from '../common/transaction-integrity';

const ORDER_TRANSITIONS: Record<string, OrderStatus[]> = {
  DRAFT: ['AWAITING_PAYMENT', 'NEW', 'CANCELLED'],
  AWAITING_PAYMENT: ['NEW', 'PAYMENT_REVIEW', 'CANCELLED'],
  PAYMENT_REVIEW: ['NEW', 'CANCELLED'],
  NEW: ['ACCEPTED', 'PREPARING', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['PARTIALLY_READY', 'READY', 'CANCELLED'],
  PARTIALLY_READY: ['READY', 'CANCELLED'],
  READY: ['SERVED', 'COMPLETED'],
  SERVED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDED: [],
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly outbox: OutboxService,
    @Inject(forwardRef(() => KitchenService))
    private readonly kitchen: KitchenService,
    private readonly vouchers: VouchersService,
    private readonly promotions: PromotionsService,
    private readonly tips: TipsService,
    private readonly loyalty: LoyaltyService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly payments: PaymentsService,
  ) {}

  private async nextOrderNumber(branchId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const count = await this.prisma.order.count({
      where: { branchId, createdAt: { gte: start } },
    });
    return `A-${String(count + 1).padStart(4, '0')}`;
  }

  async checkout(dto: {
    branchId: string;
    tableSessionId?: string;
    tableId?: string;
    type?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerId?: string;
    notes?: string;
    tipAmount?: number;
    voucherCode?: string;
    redeemPoints?: number;
    idempotencyKey: string;
    items: {
      menuItemId: string;
      quantity: number;
      notes?: string;
      modifiers?: { modifierId: string }[];
    }[];
  }, options: { skipPayment?: boolean } = {}) {
    if (!dto.idempotencyKey) throw new BadRequestException('idempotencyKey required');
    const inputError = checkoutInputError(dto);
    if (inputError) throw new BadRequestException(inputError);

    const existing = await this.prisma.order.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
      include: { items: true, payments: true },
    });
    if (existing) return existing;

    const branch = await this.prisma.branch.findUnique({ where: { id: dto.branchId } });
    if (!branch) throw new NotFoundException('Branch not found');
    if (branch.status !== 'ACTIVE') throw new BadRequestException('Branch inactive');

    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: dto.items.map((i) => i.menuItemId) } },
      include: {
        branchItems: { where: { branchId: dto.branchId } },
        category: { include: { menu: true } },
      },
    });
    const map = new Map(menuItems.map((m) => [m.id, m]));
    const modifierIds = dto.items.flatMap((i) => (i.modifiers || []).map((m) => m.modifierId));
    const modifiers = await this.prisma.modifier.findMany({
      where: { id: { in: modifierIds } },
      include: { group: { include: { itemLinks: true } } },
    });
    const modifierMap = new Map(modifiers.map((m) => [m.id, m]));

    const lines = dto.items.map((i) => {
      const mi = map.get(i.menuItemId);
      if (!mi) throw new BadRequestException(`Item ${i.menuItemId} not found`);
      if (
        !mi.isActive || mi.deletedAt || !mi.category.isActive || !mi.category.menu.isActive ||
        mi.category.menu.brandId !== branch.brandId ||
        (mi.category.menu.branchId && mi.category.menu.branchId !== branch.id)
      ) {
        throw new BadRequestException(`${mi.name} unavailable`);
      }
      if (mi.maxPerOrder != null && i.quantity > mi.maxPerOrder) {
        throw new BadRequestException(`${mi.name} exceeds maximum quantity`);
      }
      const ov = mi.branchItems[0];
      if (ov?.isSoldOut || ov?.isAvailable === false) {
        throw new BadRequestException(`${mi.name} unavailable`);
      }
      const resolvedModifiers = (i.modifiers || []).map(({ modifierId }) => {
        const modifier = modifierMap.get(modifierId);
        if (!modifier || !modifier.group.itemLinks.some((link) => link.menuItemId === mi.id)) {
          throw new BadRequestException(`Modifier ${modifierId} is not valid for item ${mi.id}`);
        }
        return { name: modifier.name, priceDelta: modifier.priceDelta };
      });
      return {
        menuItemId: mi.id,
        name: mi.name,
        unitPrice: ov?.price ?? mi.basePrice,
        quantity: i.quantity,
        notes: i.notes,
        modifiers: resolvedModifiers,
        stationId: mi.stationId || undefined,
      };
    });

    let orderDiscount = 0;
    let voucherId: string | undefined;
    let loyaltyAccountId: string | undefined;
    let redeemPoints = Math.max(0, Math.floor(dto.redeemPoints || 0));
    let loyaltyDiscount = 0;

    // resolve customer by phone for loyalty if needed
    let customerId = dto.customerId;
    if (!customerId && dto.customerPhone) {
      const c = await this.loyalty.findCustomerByPhone(dto.customerPhone, branch.organizationId);
      customerId = c?.id;
    }

    if (dto.voucherCode) {
      const v = await this.vouchers.validateAndQuote(dto.voucherCode, {
        organizationId: branch.organizationId,
        branchId: branch.id,
        subtotal: lines.reduce((s, l) => s + (l.unitPrice + (l.modifiers || []).reduce((a, m) => a + m.priceDelta, 0)) * l.quantity, 0),
        customerId,
      });
      orderDiscount = v.discount;
      voucherId = v.voucherId;
    }

    const promo = await this.promotions.bestDiscount({
      organizationId: branch.organizationId,
      branchId: branch.id,
      subtotal: lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    });
    if (promo.discount > orderDiscount && !voucherId) {
      orderDiscount = promo.discount;
    }

    if (redeemPoints > 0) {
      if (!customerId) throw new BadRequestException('Phone/member required to redeem points');
      const acc = await this.loyalty.findAccount(customerId, branch.organizationId);
      if (!acc || acc.balance < redeemPoints) throw new BadRequestException('Insufficient points');
      loyaltyAccountId = acc.id;
      loyaltyDiscount = await this.loyalty.quoteRedeemDiscount(branch.organizationId, redeemPoints);
      orderDiscount += loyaltyDiscount;
    }

    const priced = this.pricing.calculate({
      lines,
      taxBps: branch.taxBps,
      serviceChargeBps: branch.serviceChargeBps,
      tipAmount: dto.tipAmount || 0,
      orderDiscount,
    });

    const orderNumber = await this.nextOrderNumber(branch.id);
    const publicToken = randomBytes(16).toString('hex');
    const type: OrderType = (dto.type as OrderType) || (dto.tableSessionId ? 'DINE_IN_QR' : 'TAKEAWAY_POS');
    const initialStatus: OrderStatus = options.skipPayment ? 'NEW' : 'AWAITING_PAYMENT';

    const order = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          organizationId: branch.organizationId,
          branchId: branch.id,
          tableSessionId: dto.tableSessionId,
          tableId: dto.tableId,
          customerId,
          type,
          status: initialStatus,
          orderNumber,
          publicToken,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail,
          notes: dto.notes,
          subtotal: priced.subtotal,
          discountTotal: priced.itemDiscount + priced.orderDiscount,
          taxTotal: priced.taxTotal,
          serviceChargeTotal: priced.serviceChargeTotal,
          tipTotal: priced.tipTotal,
          grandTotal: priced.grandTotal,
          idempotencyKey: dto.idempotencyKey,
          voucherId,
          items: {
            create: priced.lines.map((l) => ({
              menuItemId: l.menuItemId,
              nameSnapshot: l.name,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              lineTotal: l.lineTotal,
              notes: l.notes,
              stationId: l.stationId,
              modifiers: {
                create: l.modifiers.map((m) => ({
                  nameSnapshot: m.name,
                  priceDelta: m.priceDelta,
                })),
              },
            })),
          },
          priceComponents: {
            create: [
              ...priced.components.map((c) => ({
                type: c.type,
                label: c.label,
                amount: c.amount,
                meta: c.meta as Prisma.InputJsonValue,
              })),
              ...(loyaltyDiscount
                ? [
                    {
                      type: 'LOYALTY_REDEEM',
                      label: `Redeem ${redeemPoints} poin`,
                      amount: -loyaltyDiscount,
                      meta: { points: redeemPoints } as Prisma.InputJsonValue,
                    },
                  ]
                : []),
            ],
          },
          statusHistory: {
            create: { toStatus: initialStatus, reason: 'checkout' },
          },
        },
        include: { items: { include: { modifiers: true } }, payments: true },
      });

      if (voucherId) {
        await this.vouchers.reserve(voucherId, o.id, customerId, tx as any);
      }

      if (loyaltyAccountId && redeemPoints > 0) {
        await this.loyalty.redeem(loyaltyAccountId, redeemPoints, o.id, tx as any);
      }

      if (priced.tipTotal > 0) {
        await this.tips.createForOrder(o.id, priced.tipTotal, tx as any);
      }

      await this.outbox.publish(
        'ORDER_CREATED',
        'order',
        o.id,
        { orderId: o.id, status: o.status, branchId: o.branchId },
        tx as any,
      );

      if (options.skipPayment) {
        await this.outbox.publish(
          'ORDER_STATUS_CHANGED',
          'order',
          o.id,
          { orderId: o.id, status: 'NEW' },
          tx as any,
        );
      }

      return o;
    });

    if (options.skipPayment) {
      await this.kitchen.createTicketsForOrder(order.id);
      return order;
    }

    const snap = await this.payments.createSnapForOrder(order.id);
    const full = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { modifiers: true } }, payments: true },
    });
    return { ...full!, snapToken: snap.snapToken, clientKey: snap.clientKey, mock: (snap as any).mock };
  }

  async getByPublicToken(token: string) {
    const order = await this.prisma.order.findUnique({
      where: { publicToken: token },
      include: {
        items: { include: { modifiers: true } },
        payments: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        kitchenTickets: true,
      },
    });
    if (!order) throw new NotFoundException();
    return order;
  }

  async get(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { modifiers: true } },
        payments: true,
        kitchenTickets: true,
      },
    });
    if (!order) throw new NotFoundException();
    return order;
  }

  list(filters: { branchId?: string; status?: OrderStatus; organizationId?: string }) {
    return this.prisma.order.findMany({
      where: {
        branchId: filters.branchId,
        status: filters.status,
        organizationId: filters.organizationId,
      },
      include: { items: true, payments: true, tips: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async updateStatus(id: string, toStatus: OrderStatus, actorId?: string, reason?: string) {
    const order = await this.get(id);
    const allowed = ORDER_TRANSITIONS[order.status] || [];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(`Cannot transition ${order.status} → ${toStatus}`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id },
        data: { status: toStatus },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus,
          actorId,
          reason,
        },
      });
      await this.outbox.publish(
        'ORDER_STATUS_CHANGED',
        'order',
        id,
        { orderId: id, from: order.status, to: toStatus, branchId: order.branchId },
        tx as any,
      );
      if (toStatus === 'CANCELLED') {
        await this.vouchers.release(id, tx as any);
        await this.loyalty.restoreRedeem(id, tx as any);
      }
      return o;
    });

    if (toStatus === 'COMPLETED') {
      await this.loyalty.earnForOrder(id);
    }

    return updated;
  }

  async markPaid(orderId: string) {
    const order = await this.get(orderId);
    if (order.status === 'NEW' || order.status === 'COMPLETED') return order;
    if (!['AWAITING_PAYMENT', 'PAYMENT_REVIEW', 'DRAFT'].includes(order.status)) {
      throw new BadRequestException('Order not awaiting payment');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'NEW' },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'NEW',
          reason: 'payment_paid',
        },
      });
      if (order.voucherId) {
        await this.vouchers.consume(order.voucherId, orderId, order.discountTotal, tx as any);
      }
      if (order.tableSessionId) {
        await tx.tableSession.update({
          where: { id: order.tableSessionId },
          data: {
            status: 'ACTIVE',
            totalSpending: { increment: order.grandTotal },
          },
        });
      }
      await this.outbox.publish(
        'PAYMENT_PAID',
        'order',
        orderId,
        { orderId, branchId: order.branchId },
        tx as any,
      );
    });

    await this.kitchen.createTicketsForOrder(orderId);
    return this.get(orderId);
  }

  async reorder(publicToken: string, dto: {
    items: any[];
    idempotencyKey: string;
    tipAmount?: number;
    voucherCode?: string;
    customerName?: string;
  }) {
    const prev = await this.getByPublicToken(publicToken);
    if (!prev.tableSessionId) throw new BadRequestException('No table session');
    return this.checkout({
      branchId: prev.branchId,
      tableSessionId: prev.tableSessionId,
      tableId: prev.tableId || undefined,
      type: 'DINE_IN_QR',
      customerName: dto.customerName || prev.customerName || undefined,
      customerPhone: prev.customerPhone || undefined,
      customerId: prev.customerId || undefined,
      tipAmount: dto.tipAmount,
      voucherCode: dto.voucherCode,
      idempotencyKey: dto.idempotencyKey,
      items: dto.items,
    });
  }

  async voidItem(orderId: string, orderItemId: string, actorId: string, reason?: string) {
    const order = await this.get(orderId);
    if (['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(order.status)) {
      throw new BadRequestException('Cannot void item on closed order');
    }
    const item = order.items.find((i) => i.id === orderItemId);
    if (!item) throw new NotFoundException('Item not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.kitchenTicketItem.deleteMany({ where: { orderItemId } });
      await tx.orderItem.delete({ where: { id: orderItemId } });
      await tx.kitchenTicket.deleteMany({ where: { orderId, items: { none: {} } } });
      const remaining = await tx.orderItem.findMany({ where: { orderId } });
      const branch = await tx.branch.findUniqueOrThrow({ where: { id: order.branchId } });
      const priced = this.pricing.calculate({
        lines: remaining.map((i) => ({
          name: i.nameSnapshot,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
        })),
        taxBps: branch.taxBps,
        serviceChargeBps: branch.serviceChargeBps,
        tipAmount: order.tipTotal,
        orderDiscount: order.discountTotal,
      });
      await tx.orderPriceComponent.deleteMany({ where: { orderId } });
      await tx.orderPriceComponent.createMany({
        data: priced.components.map((component) => ({
          orderId,
          type: component.type,
          label: component.label,
          amount: component.amount,
          meta: component.meta as Prisma.InputJsonValue,
        })),
      });
      await tx.order.update({
        where: { id: orderId },
        data: {
          subtotal: priced.subtotal,
          discountTotal: priced.itemDiscount + priced.orderDiscount,
          taxTotal: priced.taxTotal,
          serviceChargeTotal: priced.serviceChargeTotal,
          grandTotal: priced.grandTotal,
        },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: order.status,
          actorId,
          reason: reason || `void item ${item.nameSnapshot}`,
        },
      });
    });
    return this.get(orderId);
  }

  async transferTable(orderId: string, tableId: string, actorId: string) {
    const order = await this.get(orderId);
    const table = await this.prisma.cafeTable.findUnique({ where: { id: tableId } });
    if (!table || table.branchId !== order.branchId) {
      throw new BadRequestException('Table not in same branch');
    }
    if (table.id !== order.tableId && table.status !== 'AVAILABLE') {
      throw new BadRequestException('Target table unavailable');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { tableId } });
      if (order.tableSessionId) {
        await tx.tableSession.update({ where: { id: order.tableSessionId }, data: { tableId } });
      }
      await tx.cafeTable.update({ where: { id: tableId }, data: { status: 'OCCUPIED' } });
      if (order.tableId && order.tableId !== tableId) {
        const other = await tx.tableSession.count({
          where: {
            tableId: order.tableId,
            id: order.tableSessionId ? { not: order.tableSessionId } : undefined,
            status: { in: ['OPEN', 'ACTIVE', 'CHECKOUT_IN_PROGRESS', 'CLOSING'] },
          },
        });
        if (!other) await tx.cafeTable.update({ where: { id: order.tableId }, data: { status: 'AVAILABLE' } });
      }
      await this.outbox.publish('ORDER_STATUS_CHANGED', 'order', orderId, {
        orderId, branchId: order.branchId, to: 'TABLE_TRANSFERRED', tableId, actorId,
      }, tx as any);
    });
    return this.get(orderId);
  }

  async reprint(orderId: string) {
    const tickets = await this.prisma.kitchenTicket.findMany({ where: { orderId } });
    let n = 0;
    for (const t of tickets) {
      const r = await this.prisma.printJob.updateMany({
        where: { ticketId: t.id },
        data: { status: 'QUEUED', claimedAt: null },
      });
      n += r.count;
      if (!r.count) {
        // re-enqueue via kitchen if no prior jobs
        await this.kitchen.createTicketsForOrder(orderId).catch(() => undefined);
        break;
      }
    }
    return { orderId, reprinted: n || tickets.length };
  }

  async mergeSessions(sourceSessionId: string, targetSessionId: string, actorId: string) {
    if (sourceSessionId === targetSessionId) throw new BadRequestException('Same session');
    const [src, tgt] = await Promise.all([
      this.prisma.tableSession.findUnique({ where: { id: sourceSessionId } }),
      this.prisma.tableSession.findUnique({ where: { id: targetSessionId } }),
    ]);
    if (!src || !tgt || src.branchId !== tgt.branchId) {
      throw new BadRequestException('Invalid sessions');
    }
    if (['CLOSED', 'CANCELLED'].includes(src.status) || ['CLOSED', 'CANCELLED'].includes(tgt.status)) {
      throw new BadRequestException('Session closed');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { tableSessionId: sourceSessionId },
        data: { tableSessionId: targetSessionId, tableId: tgt.tableId },
      });
      await tx.tableSession.update({
        where: { id: sourceSessionId },
        data: { status: 'CLOSED', closedAt: new Date() },
      });
      await tx.tableSession.update({
        where: { id: targetSessionId },
        data: {
          totalSpending: { increment: src.totalSpending || 0 },
        },
      });
      await tx.cafeTable.update({ where: { id: tgt.tableId }, data: { status: 'OCCUPIED' } });
      if (src.tableId !== tgt.tableId) {
        await tx.cafeTable.update({ where: { id: src.tableId }, data: { status: 'AVAILABLE' } });
      }
    });
    return { merged: true, targetSessionId, actorId };
  }
}
