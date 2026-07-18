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
exports.LoyaltyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LoyaltyService = class LoyaltyService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findCustomerByPhone(phone, organizationId) {
        const normalized = phone.replace(/\D/g, '');
        if (!normalized)
            return null;
        const customers = await this.prisma.customer.findMany({
            where: {
                phone: { not: null },
                OR: [
                    { profiles: { some: { organizationId } } },
                    { memberships: { some: { organizationId } } },
                    { loyaltyAccounts: { some: { organizationId } } },
                ],
            },
        });
        return customers.find((customer) => customer.phone?.replace(/\D/g, '') === normalized) || null;
    }
    async earnForOrder(orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order?.customerId)
            return null;
        if (order.status !== 'COMPLETED')
            return null;
        const existing = await this.prisma.loyaltyLedgerEntry.findFirst({
            where: { orderId, entryType: 'EARN' },
        });
        if (existing)
            return existing;
        const rule = await this.prisma.loyaltyRule.findFirst({
            where: { organizationId: order.organizationId, isActive: true },
        });
        if (!rule)
            return null;
        let base = order.subtotal - order.discountTotal;
        if (!rule.excludeTax)
            base += order.taxTotal;
        if (!rule.excludeService)
            base += order.serviceChargeTotal;
        if (!rule.excludeTip)
            base += order.tipTotal;
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
        if (points <= 0)
            return null;
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
    async quoteRedeemDiscount(organizationId, points) {
        if (points <= 0)
            return 0;
        const rule = await this.prisma.loyaltyRule.findFirst({
            where: { organizationId, isActive: true },
        });
        const per = rule?.pointsPerAmount || 1;
        const unit = rule?.amountUnit || 10_000;
        return Math.floor((points * unit) / per);
    }
    async findAccount(customerId, organizationId) {
        return this.prisma.loyaltyAccount.findUnique({
            where: { customerId_organizationId: { customerId, organizationId } },
        });
    }
    async redeem(accountId, points, orderId, tx) {
        const client = tx || this.prisma;
        const account = await client.loyaltyAccount.findUnique({ where: { id: accountId } });
        if (!account || account.balance < points)
            throw new common_1.BadRequestException('Insufficient points');
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
    async restoreRedeem(orderId, tx) {
        const client = tx || this.prisma;
        const restored = await client.loyaltyLedgerEntry.findMany({
            where: { orderId, entryType: 'REDEEM_RESTORE' },
        });
        if (restored.length)
            return;
        const entries = await client.loyaltyLedgerEntry.findMany({
            where: { orderId, entryType: 'REDEEM' },
        });
        for (const e of entries) {
            const pts = Math.abs(e.points);
            await client.loyaltyAccount.update({
                where: { id: e.accountId },
                data: { balance: { increment: pts } },
            });
            await client.loyaltyLedgerEntry.create({
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
    async adjust(accountId, points, reason) {
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
    getAccount(id) {
        return this.prisma.loyaltyAccount.findUnique({
            where: { id },
            include: { entries: { orderBy: { createdAt: 'desc' }, take: 50 } },
        });
    }
};
exports.LoyaltyService = LoyaltyService;
exports.LoyaltyService = LoyaltyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoyaltyService);
//# sourceMappingURL=loyalty.service.js.map