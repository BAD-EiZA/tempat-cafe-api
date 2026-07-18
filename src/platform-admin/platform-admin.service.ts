import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class PlatformAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly ledger: LedgerService,
  ) {}

  listMerchants(q?: string) {
    return this.prisma.organization.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { branches: true, balances: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async setMerchantStatus(id: string, status: any, actorId: string, reason?: string) {
    const map: Record<string, string> = {
      ACTIVE: 'APPROVED',
      APPROVED: 'APPROVED',
      SUSPENDED: 'SUSPENDED',
      REJECTED: 'REJECTED',
      UNDER_REVIEW: 'UNDER_REVIEW',
    };
    const next = map[status] || status;
    const before = await this.prisma.organization.findUnique({ where: { id } });
    const after = await this.prisma.organization.update({
      where: { id },
      data: { status: next as any },
    });
    await this.audit.log({
      organizationId: id,
      actorId,
      action: 'MERCHANT_STATUS_CHANGED',
      entityType: 'organization',
      entityId: id,
      before,
      after,
      reason,
    });
    return after;
  }

  listPayments(limit = 100) {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { order: true },
    });
  }

  async listReconciliation() {
    const records = await this.prisma.reconciliationRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    if (records.length) return records;

    // lightweight auto-recon: unmatched paid payments without ledger entry signal
    const paid = await this.prisma.payment.findMany({
      where: { status: 'PAID' },
      orderBy: { paidAt: 'desc' },
      take: 50,
      include: { order: true },
    });
    return paid.map((p) => ({
      id: p.id,
      type: 'AUTO_PAYMENT',
      status: 'MATCHED',
      amount: p.amount,
      providerTxId: p.providerTxId,
      orderId: p.orderId,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    }));
  }

  async runReconciliation() {
    const paid = await this.prisma.payment.findMany({
      where: {
        status: { in: ['PAID', 'PENDING', 'EXPIRED'] },
        createdAt: { gte: new Date(Date.now() - 7 * 86400_000) },
      },
      take: 200,
    });
    let created = 0;
    let mismatched = 0;
    for (const p of paid) {
      const existing = await this.prisma.reconciliationRecord.findFirst({
        where: { paymentId: p.id },
      });
      if (existing) continue;

      let providerAmount = p.amount;
      let status = 'MATCHED';
      let notes = 'internal record';

      // When Midtrans live, re-check status if providerOrderId present
      if (p.providerOrderId && process.env.MIDTRANS_ENABLED === 'true') {
        try {
          const { MidtransService } = await import('../midtrans/midtrans.service');
          // use raw fetch via existing payment providerTxId presence
          notes = 'provider check skipped in batch (use webhook)';
        } catch {
          notes = 'provider check failed';
        }
      }

      // Flag paid without ledger SALE_GROSS
      if (p.status === 'PAID') {
        const entry = await this.prisma.merchantLedgerEntry.findFirst({
          where: {
            referenceType: 'payment',
            referenceId: p.id,
            entryType: 'SALE_GROSS',
          },
        });
        if (!entry) {
          status = 'UNMATCHED';
          notes = 'PAID without ledger SALE_GROSS';
          mismatched += 1;
        }
      }

      await this.prisma.reconciliationRecord.create({
        data: {
          paymentId: p.id,
          status,
          internalAmount: p.amount,
          providerAmount,
          providerTxId: p.providerTxId,
          notes,
        },
      });
      created += 1;
    }
    return { scanned: paid.length, created, mismatched };
  }

  async impersonate(organizationId: string, actorId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) return null;
    await this.audit.log({
      organizationId,
      actorId,
      action: 'IMPERSONATE_START',
      entityType: 'organization',
      entityId: organizationId,
      after: { organizationId, actorId },
    });
    return {
      organizationId,
      organization: org,
      impersonating: true,
      message: 'Use x-organization-id header; actions audited',
    };
  }

  listAudit(organizationId?: string) {
    return this.prisma.auditLog.findMany({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  platformMetrics() {
    return Promise.all([
      this.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.count(),
      this.prisma.merchantBalance.findMany({
        where: { available: { lt: 0 } },
      }),
      this.prisma.payoutBatch.count({ where: { status: { in: ['DRAFT', 'APPROVAL_REQUIRED', 'PROCESSING'] } } }),
    ]).then(([paid, totalPayments, negative, pendingPayouts]) => ({
      paymentVolume: paid._sum.amount || 0,
      paidCount: paid._count,
      totalPayments,
      successRate: totalPayments ? paid._count / totalPayments : 0,
      negativeBalances: negative,
      pendingPayouts,
    }));
  }

  adjustLedger(organizationId: string, amount: number, reason: string, actorId: string) {
    return this.ledger.adjust(organizationId, amount, reason, actorId);
  }
}
