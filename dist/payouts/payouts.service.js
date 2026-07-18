"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const tenant_1 = require("../common/tenant");
const transaction_security_1 = require("../payments/transaction-security");
let PayoutsService = class PayoutsService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    list(user, organizationId) {
        if (organizationId)
            (0, tenant_1.assertOrgAccess)(user, organizationId);
        return this.prisma.payoutBatch.findMany({
            where: organizationId
                ? { organizationId }
                : (0, tenant_1.isPlatformAdmin)(user)
                    ? undefined
                    : { organizationId: { in: user.organizationIds } },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createBatch(organizationId, amount, user) {
        (0, tenant_1.assertOrgAccess)(user, organizationId);
        if (!(0, transaction_security_1.isValidPayoutAmount)(amount)) {
            throw new common_1.BadRequestException('Amount must be a positive integer');
        }
        const balance = await this.prisma.merchantBalance.findUnique({
            where: { organizationId },
        });
        if (!balance || balance.available < amount) {
            throw new common_1.BadRequestException('Insufficient available balance');
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
    async submitApproval(id, user) {
        const batch = await this.prisma.payoutBatch.findUnique({ where: { id } });
        if (batch)
            (0, tenant_1.assertOrgAccess)(user, batch.organizationId);
        if (!batch || batch.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Only DRAFT batches can be submitted');
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
    async approve(id, user) {
        const batch = await this.prisma.payoutBatch.findUnique({ where: { id } });
        if (!batch)
            throw new common_1.BadRequestException('Not found');
        (0, tenant_1.assertOrgAccess)(user, batch.organizationId);
        if (batch.status !== 'APPROVAL_REQUIRED') {
            throw new common_1.BadRequestException('Submit for approval first (status APPROVAL_REQUIRED)');
        }
        if (batch.createdBy && batch.createdBy === user.id) {
            throw new common_1.BadRequestException('Creator cannot approve own payout batch');
        }
        return this.prisma.$transaction(async (tx) => {
            const balance = await tx.merchantBalance.findUnique({
                where: { organizationId: batch.organizationId },
            });
            if (!balance || balance.available < batch.amount) {
                throw new common_1.BadRequestException('Insufficient balance');
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
};
exports.PayoutsService = PayoutsService;
exports.PayoutsService = PayoutsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], PayoutsService);
//# sourceMappingURL=payouts.service.js.map