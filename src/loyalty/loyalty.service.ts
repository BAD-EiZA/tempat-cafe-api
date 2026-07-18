import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  async earnForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order?.customerId) return null;
    if (order.status !== 'COMPLETED') return null;

    const existing = await this.prisma.loyaltyLedgerEntry.findFirst({
      where: { orderId, entryType: 'EARN' },
    });
    if (existing) return existing;

    const rule = await this.prisma.loyaltyRule.findFirst({
      where: { organizationId: order.organizationId, isActive: true },
    });
    if (!rule) return null;

    let base = order.subtotal - order.discountTotal;
    if (!rule.excludeTax) base += order.taxTotal;
    if (!rule.excludeService) base += order.serviceChargeTotal;
    if (!rule.excludeTip) base += order.tipTotal;
    base = Math.max(0, base);

    const membership = await this.prisma.customerMembership.findUnique({
      where: {
        customerId_organizationId: {
          customerId: order.customerId,
          organizationId: order.organizationId,
        },
      },
      include: { tier: true },
    });
    const multiplier = membership?.tier.pointMultiplier || 1;
    const points = Math.floor((base / rule.amountUnit) * rule.pointsPerAmount * multiplier);
    if (points <= 0) return null;

    const account = await this.prisma.loyaltyAccount.upsert({
      where: {
        customerId_organizationId: {
          customerId: order.customerId,
          organizationId: order.organizationId,
        },
      },
      create: {
        customerId: order.customerId,
        organizationId: order.organizationId,
        balance: points,
        lifetimeEarned: points,
      },
      update: {
        balance: { increment: points },
        lifetimeEarned: { increment: points },
      },
    });

    return this.prisma.loyaltyLedgerEntry.create({
      data: {
        accountId: account.id,
        entryType: 'EARN',
        points,
        orderId,
      },
    });
  }

  /** IDR discount for N points using org rule (default 1 pt ≈ amountUnit/pointsPerAmount). */
  async quoteRedeemDiscount(organizationId: string, points: number) {
    if (points <= 0) return 0;
    const rule = await this.prisma.loyaltyRule.findFirst({
      where: { organizationId, isActive: true },
    });
    const per = rule?.pointsPerAmount || 1;
    const unit = rule?.amountUnit || 10_000;
    return Math.floor((points * unit) / per);
  }

  async findAccount(customerId: string, organizationId: string) {
    return this.prisma.loyaltyAccount.findUnique({
      where: { customerId_organizationId: { customerId, organizationId } },
    });
  }

  async redeem(accountId: string, points: number, orderId?: string, tx?: any) {
    const client = tx || this.prisma;
    const account = await client.loyaltyAccount.findUnique({ where: { id: accountId } });
    if (!account || account.balance < points) throw new BadRequestException('Insufficient points');
    await client.loyaltyAccount.update({
      where: { id: accountId },
      data: { balance: { decrement: points } },
    });
    return client.loyaltyLedgerEntry.create({
      data: {
        accountId,
        entryType: 'REDEEM',
        points: -points,
        orderId,
      },
    });
  }

  async restoreRedeem(orderId: string) {
    const entries = await this.prisma.loyaltyLedgerEntry.findMany({
      where: { orderId, entryType: 'REDEEM' },
    });
    for (const e of entries) {
      const pts = Math.abs(e.points);
      await this.prisma.loyaltyAccount.update({
        where: { id: e.accountId },
        data: { balance: { increment: pts } },
      });
      await this.prisma.loyaltyLedgerEntry.create({
        data: {
          accountId: e.accountId,
          entryType: 'REDEEM_RESTORE',
          points: pts,
          orderId,
          meta: { restoredFrom: e.id },
        },
      });
    }
  }

  async adjust(accountId: string, points: number, reason: string) {
    await this.prisma.loyaltyAccount.update({
      where: { id: accountId },
      data: {
        balance: { increment: points },
        lifetimeEarned: points > 0 ? { increment: points } : undefined,
      },
    });
    return this.prisma.loyaltyLedgerEntry.create({
      data: {
        accountId,
        entryType: 'MANUAL_ADJUSTMENT',
        points,
        meta: { reason },
      },
    });
  }

  getAccount(id: string) {
    return this.prisma.loyaltyAccount.findUnique({
      where: { id },
      include: { entries: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });
  }
}
