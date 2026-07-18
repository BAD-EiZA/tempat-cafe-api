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
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let LedgerService = class LedgerService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async account(organizationId, code) {
        let acc = await this.prisma.merchantLedgerAccount.findUnique({
            where: { organizationId_code: { organizationId, code } },
        });
        if (!acc) {
            acc = await this.prisma.merchantLedgerAccount.create({
                data: { organizationId, code, name: code },
            });
        }
        return acc;
    }
    async postSale(paymentId) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { order: true },
        });
        if (!payment || payment.status !== 'PAID')
            return;
        const existing = await this.prisma.merchantLedgerEntry.findFirst({
            where: {
                referenceType: 'payment',
                referenceId: paymentId,
                entryType: 'SALE_GROSS',
            },
        });
        if (existing)
            return;
        const orgId = payment.organizationId;
        const pending = await this.account(orgId, 'PENDING');
        const tipAcc = await this.account(orgId, 'TIP_PAYABLE');
        const feeBps = Number(this.config.get('PLATFORM_FEE_BPS') || 250);
        const gatewayFeeBps = Number(this.config.get('GATEWAY_FEE_BPS') || 70);
        const reserveBps = Number(this.config.get('RESERVE_BPS') || 0);
        const tip = payment.order.tipTotal || 0;
        const gross = payment.amount;
        const platformFee = Math.floor((gross * feeBps) / 10_000);
        const gatewayFee = Math.floor((gross * gatewayFeeBps) / 10_000);
        const reserveHold = Math.floor((gross * reserveBps) / 10_000);
        const net = gross - platformFee - gatewayFee - reserveHold - tip;
        await this.prisma.$transaction(async (tx) => {
            const rows = [
                {
                    organizationId: orgId,
                    accountId: pending.id,
                    entryType: 'SALE_GROSS',
                    referenceType: 'payment',
                    referenceId: paymentId,
                    credit: gross,
                    debit: 0,
                    occurredAt: payment.paidAt || new Date(),
                },
                {
                    organizationId: orgId,
                    accountId: pending.id,
                    entryType: 'PLATFORM_FEE',
                    referenceType: 'payment',
                    referenceId: paymentId,
                    debit: platformFee,
                    credit: 0,
                    occurredAt: payment.paidAt || new Date(),
                },
                {
                    organizationId: orgId,
                    accountId: pending.id,
                    entryType: 'PAYMENT_GATEWAY_FEE',
                    referenceType: 'payment',
                    referenceId: paymentId,
                    debit: gatewayFee,
                    credit: 0,
                    occurredAt: payment.paidAt || new Date(),
                },
            ];
            if (reserveHold > 0) {
                rows.push({
                    organizationId: orgId,
                    accountId: pending.id,
                    entryType: 'RESERVE_HOLD',
                    referenceType: 'payment',
                    referenceId: paymentId,
                    debit: reserveHold,
                    credit: 0,
                    occurredAt: payment.paidAt || new Date(),
                });
            }
            if (tip) {
                rows.push({
                    organizationId: orgId,
                    accountId: tipAcc.id,
                    entryType: 'TIP_PAYABLE',
                    referenceType: 'payment',
                    referenceId: paymentId,
                    credit: tip,
                    debit: 0,
                    occurredAt: payment.paidAt || new Date(),
                });
            }
            await tx.merchantLedgerEntry.createMany({ data: rows });
            await tx.merchantBalance.upsert({
                where: { organizationId: orgId },
                create: {
                    organizationId: orgId,
                    pending: net,
                    tipPayable: tip,
                },
                update: {
                    pending: { increment: net },
                    tipPayable: { increment: tip },
                },
            });
        });
    }
    async settlePending(olderThanHours = 24) {
        const cutoff = new Date(Date.now() - olderThanHours * 3600_000);
        const entries = await this.prisma.merchantLedgerEntry.findMany({
            where: {
                entryType: 'SALE_GROSS',
                referenceType: 'payment',
                occurredAt: { lte: cutoff },
                meta: { equals: undefined },
            },
            take: 100,
        });
        const paid = await this.prisma.payment.findMany({
            where: {
                status: 'PAID',
                paidAt: { lte: cutoff },
            },
            take: 100,
        });
        let settled = 0;
        for (const payment of paid) {
            const already = await this.prisma.merchantLedgerEntry.findFirst({
                where: {
                    referenceType: 'payment',
                    referenceId: payment.id,
                    entryType: 'SETTLE_AVAILABLE',
                },
            });
            if (already)
                continue;
            const feeBps = Number(this.config.get('PLATFORM_FEE_BPS') || 250);
            const gatewayFeeBps = Number(this.config.get('GATEWAY_FEE_BPS') || 70);
            const reserveBps = Number(this.config.get('RESERVE_BPS') || 0);
            const order = await this.prisma.order.findUnique({ where: { id: payment.orderId } });
            const tip = order?.tipTotal || 0;
            const platformFee = Math.floor((payment.amount * feeBps) / 10_000);
            const gatewayFee = Math.floor((payment.amount * gatewayFeeBps) / 10_000);
            const reserveHold = Math.floor((payment.amount * reserveBps) / 10_000);
            const net = payment.amount - platformFee - gatewayFee - reserveHold - tip;
            if (net <= 0)
                continue;
            const orgId = payment.organizationId;
            const pending = await this.account(orgId, 'PENDING');
            const available = await this.account(orgId, 'AVAILABLE');
            await this.prisma.$transaction(async (tx) => {
                await tx.merchantLedgerEntry.createMany({
                    data: [
                        {
                            organizationId: orgId,
                            accountId: pending.id,
                            entryType: 'SETTLE_AVAILABLE',
                            referenceType: 'payment',
                            referenceId: payment.id,
                            debit: net,
                            credit: 0,
                            occurredAt: new Date(),
                        },
                        {
                            organizationId: orgId,
                            accountId: available.id,
                            entryType: 'SETTLE_AVAILABLE',
                            referenceType: 'payment',
                            referenceId: payment.id,
                            debit: 0,
                            credit: net,
                            occurredAt: new Date(),
                        },
                    ],
                });
                await tx.merchantBalance.update({
                    where: { organizationId: orgId },
                    data: {
                        pending: { decrement: net },
                        available: { increment: net },
                    },
                });
            });
            settled += 1;
        }
        return { settled, scanned: paid.length, unusedEntries: entries.length };
    }
    async postRefund(paymentId, amount, refundId) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment)
            return;
        const existing = await this.prisma.merchantLedgerEntry.findFirst({
            where: { referenceType: 'refund', referenceId: refundId, entryType: 'REFUND_DEBIT' },
        });
        if (existing)
            return;
        const available = await this.account(payment.organizationId, 'AVAILABLE');
        const bal = await this.prisma.merchantBalance.findUnique({
            where: { organizationId: payment.organizationId },
        });
        const fromAvailable = Math.min(amount, bal?.available || 0);
        const fromPending = amount - fromAvailable;
        await this.prisma.$transaction(async (tx) => {
            if (fromAvailable > 0) {
                await tx.merchantLedgerEntry.create({
                    data: {
                        organizationId: payment.organizationId,
                        accountId: available.id,
                        entryType: 'REFUND_DEBIT',
                        referenceType: 'refund',
                        referenceId: refundId,
                        debit: fromAvailable,
                        credit: 0,
                        occurredAt: new Date(),
                    },
                });
            }
            if (fromPending > 0) {
                const pending = await this.account(payment.organizationId, 'PENDING');
                await tx.merchantLedgerEntry.create({
                    data: {
                        organizationId: payment.organizationId,
                        accountId: pending.id,
                        entryType: 'REFUND_DEBIT',
                        referenceType: 'refund',
                        referenceId: refundId,
                        debit: fromPending,
                        credit: 0,
                        occurredAt: new Date(),
                    },
                });
            }
            await tx.merchantBalance.update({
                where: { organizationId: payment.organizationId },
                data: {
                    available: { decrement: fromAvailable },
                    pending: { decrement: fromPending },
                },
            });
        });
    }
    list(organizationId) {
        return this.prisma.merchantLedgerEntry.findMany({
            where: { organizationId },
            orderBy: { postedAt: 'desc' },
            take: 200,
        });
    }
    balance(organizationId) {
        return this.prisma.merchantBalance.findUnique({ where: { organizationId } });
    }
    async adjust(organizationId, amount, reason, actorId) {
        const available = await this.account(organizationId, 'AVAILABLE');
        const entry = await this.prisma.merchantLedgerEntry.create({
            data: {
                organizationId,
                accountId: available.id,
                entryType: 'MANUAL_ADJUSTMENT',
                referenceType: 'adjustment',
                referenceId: actorId,
                debit: amount < 0 ? Math.abs(amount) : 0,
                credit: amount > 0 ? amount : 0,
                occurredAt: new Date(),
                meta: { reason },
            },
        });
        await this.prisma.merchantBalance.upsert({
            where: { organizationId },
            create: { organizationId, available: amount },
            update: { available: { increment: amount } },
        });
        return entry;
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map