import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { assertOrgAccess, isPlatformAdmin } from '../common/tenant';
import { AuthUser } from '../common/types';
import { isValidPayoutAmount } from '../payments/transaction-security';

@Injectable()
export class PayoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(user: AuthUser, organizationId?: string) {
    if (organizationId) assertOrgAccess(user, organizationId);
    return this.prisma.payoutBatch.findMany({
      where: organizationId
        ? { organizationId }
        : isPlatformAdmin(user)
          ? undefined
          : { organizationId: { in: user.organizationIds } },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBatch(organizationId: string, amount: number, user: AuthUser) {
    assertOrgAccess(user, organizationId);
    if (!isValidPayoutAmount(amount)) {
      throw new BadRequestException('Amount must be a positive integer');
    }
    const balance = await this.prisma.merchantBalance.findUnique({
      where: { organizationId },
    });
    if (!balance || balance.available < amount) {
      throw new BadRequestException('Insufficient available balance');
    }
    const batch = await this.prisma.payoutBatch.create({
      data: {
        organizationId,
        amount,
        status: 'DRAFT',
        createdBy: user.id,
      },
    });
    await this.audit.log({
      organizationId,
      actorId: user.id,
      action: 'PAYOUT_BATCH_CREATED',
      entityType: 'payout_batch',
      entityId: batch.id,
      after: batch,
    });
    return batch;
  }

  async submitApproval(id: string, user: AuthUser) {
    const batch = await this.prisma.payoutBatch.findUnique({ where: { id } });
    if (batch) assertOrgAccess(user, batch.organizationId);
    if (!batch || batch.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT batches can be submitted');
    }
    const updated = await this.prisma.payoutBatch.update({
      where: { id },
      data: { status: 'APPROVAL_REQUIRED' },
    });
    await this.audit.log({
      organizationId: batch.organizationId,
      actorId: user.id,
      action: 'PAYOUT_SUBMITTED',
      entityType: 'payout_batch',
      entityId: id,
    });
    return updated;
  }

  async approve(id: string, user: AuthUser) {
    const batch = await this.prisma.payoutBatch.findUnique({ where: { id } });
    if (!batch) throw new BadRequestException('Not found');
    assertOrgAccess(user, batch.organizationId);
    // Dual control: must be APPROVAL_REQUIRED, and approver != creator
    if (batch.status !== 'APPROVAL_REQUIRED') {
      throw new BadRequestException('Submit for approval first (status APPROVAL_REQUIRED)');
    }
    if (batch.createdBy && batch.createdBy === user.id) {
      throw new BadRequestException('Creator cannot approve own payout batch');
    }

    return this.prisma.$transaction(async (tx) => {
      const balance = await tx.merchantBalance.findUnique({
        where: { organizationId: batch.organizationId },
      });
      if (!balance || balance.available < batch.amount) {
        throw new BadRequestException('Insufficient balance');
      }
      await tx.merchantBalance.update({
        where: { organizationId: batch.organizationId },
        data: { available: { decrement: batch.amount } },
      });
      const acc = await tx.merchantLedgerAccount.findUnique({
        where: {
          organizationId_code: {
            organizationId: batch.organizationId,
            code: 'AVAILABLE',
          },
        },
      });
      if (acc) {
        await tx.merchantLedgerEntry.create({
          data: {
            organizationId: batch.organizationId,
            accountId: acc.id,
            entryType: 'PAYOUT_DEBIT',
            referenceType: 'payout_batch',
            referenceId: id,
            debit: batch.amount,
            credit: 0,
            occurredAt: new Date(),
          },
        });
      }
      return tx.payoutBatch.update({
        where: { id },
        data: { status: 'PAID', approvedBy: user.id },
      });
    });
  }
}
