"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const ledger_service_1 = require("../ledger/ledger.service");
let PlatformAdminService = class PlatformAdminService {
    constructor(prisma, audit, ledger) {
        this.prisma = prisma;
        this.audit = audit;
        this.ledger = ledger;
    }
    listMerchants(q) {
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
    async setMerchantStatus(id, status, actorId, reason) {
        const map = {
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
            data: { status: next },
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
        if (records.length)
            return records;
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
            if (existing)
                continue;
            let providerAmount = p.amount;
            let status = 'MATCHED';
            let notes = 'internal record';
            if (p.providerOrderId && process.env.MIDTRANS_ENABLED === 'true') {
                try {
                    const { MidtransService } = await Promise.resolve().then(() => __importStar(require('../midtrans/midtrans.service')));
                    notes = 'provider check skipped in batch (use webhook)';
                }
                catch {
                    notes = 'provider check failed';
                }
            }
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
    async impersonate(organizationId, actorId) {
        const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
        if (!org)
            return null;
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
    listAudit(organizationId) {
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
    adjustLedger(organizationId, amount, reason, actorId) {
        return this.ledger.adjust(organizationId, amount, reason, actorId);
    }
};
exports.PlatformAdminService = PlatformAdminService;
exports.PlatformAdminService = PlatformAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        ledger_service_1.LedgerService])
], PlatformAdminService);
//# sourceMappingURL=platform-admin.service.js.map