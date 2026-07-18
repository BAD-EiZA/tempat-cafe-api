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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const pricing_service_1 = require("../pricing/pricing.service");
const outbox_service_1 = require("../outbox/outbox.service");
const kitchen_service_1 = require("../kitchen/kitchen.service");
const vouchers_service_1 = require("../vouchers/vouchers.service");
const promotions_service_1 = require("../promotions/promotions.service");
const tips_service_1 = require("../tips/tips.service");
const loyalty_service_1 = require("../loyalty/loyalty.service");
const payments_service_1 = require("../payments/payments.service");
const transaction_integrity_1 = require("../common/transaction-integrity");
const ORDER_TRANSITIONS = {
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
let OrdersService = class OrdersService {
    constructor(prisma, pricing, outbox, kitchen, vouchers, promotions, tips, loyalty, payments) {
        this.prisma = prisma;
        this.pricing = pricing;
        this.outbox = outbox;
        this.kitchen = kitchen;
        this.vouchers = vouchers;
        this.promotions = promotions;
        this.tips = tips;
        this.loyalty = loyalty;
        this.payments = payments;
    }
    async nextOrderNumber(branchId) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const count = await this.prisma.order.count({
            where: { branchId, createdAt: { gte: start } },
        });
        return `A-${String(count + 1).padStart(4, '0')}`;
    }
    async checkout(dto, options = {}) {
        if (!dto.idempotencyKey)
            throw new common_1.BadRequestException('idempotencyKey required');
        const inputError = (0, transaction_integrity_1.checkoutInputError)(dto);
        if (inputError)
            throw new common_1.BadRequestException(inputError);
        const existing = await this.prisma.order.findUnique({
            where: { idempotencyKey: dto.idempotencyKey },
            include: { items: true, payments: true },
        });
        if (existing)
            return existing;
        const branch = await this.prisma.branch.findUnique({ where: { id: dto.branchId } });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        if (branch.status !== 'ACTIVE')
            throw new common_1.BadRequestException('Branch inactive');
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
            if (!mi)
                throw new common_1.BadRequestException(`Item ${i.menuItemId} not found`);
            if (!mi.isActive || mi.deletedAt || !mi.category.isActive || !mi.category.menu.isActive ||
                mi.category.menu.brandId !== branch.brandId ||
                (mi.category.menu.branchId && mi.category.menu.branchId !== branch.id)) {
                throw new common_1.BadRequestException(`${mi.name} unavailable`);
            }
            if (mi.maxPerOrder != null && i.quantity > mi.maxPerOrder) {
                throw new common_1.BadRequestException(`${mi.name} exceeds maximum quantity`);
            }
            const ov = mi.branchItems[0];
            if (ov?.isSoldOut || ov?.isAvailable === false) {
                throw new common_1.BadRequestException(`${mi.name} unavailable`);
            }
            const resolvedModifiers = (i.modifiers || []).map(({ modifierId }) => {
                const modifier = modifierMap.get(modifierId);
                if (!modifier || !modifier.group.itemLinks.some((link) => link.menuItemId === mi.id)) {
                    throw new common_1.BadRequestException(`Modifier ${modifierId} is not valid for item ${mi.id}`);
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
        let voucherId;
        let loyaltyAccountId;
        let redeemPoints = Math.max(0, Math.floor(dto.redeemPoints || 0));
        let loyaltyDiscount = 0;
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
            if (!customerId)
                throw new common_1.BadRequestException('Phone/member required to redeem points');
            const acc = await this.loyalty.findAccount(customerId, branch.organizationId);
            if (!acc || acc.balance < redeemPoints)
                throw new common_1.BadRequestException('Insufficient points');
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
        const publicToken = (0, crypto_1.randomBytes)(16).toString('hex');
        const type = dto.type || (dto.tableSessionId ? 'DINE_IN_QR' : 'TAKEAWAY_POS');
        const initialStatus = options.skipPayment ? 'NEW' : 'AWAITING_PAYMENT';
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
                                meta: c.meta,
                            })),
                            ...(loyaltyDiscount
                                ? [
                                    {
                                        type: 'LOYALTY_REDEEM',
                                        label: `Redeem ${redeemPoints} poin`,
                                        amount: -loyaltyDiscount,
                                        meta: { points: redeemPoints },
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
                await this.vouchers.reserve(voucherId, o.id, customerId, tx);
            }
            if (loyaltyAccountId && redeemPoints > 0) {
                await this.loyalty.redeem(loyaltyAccountId, redeemPoints, o.id, tx);
            }
            if (priced.tipTotal > 0) {
                await this.tips.createForOrder(o.id, priced.tipTotal, tx);
            }
            await this.outbox.publish('ORDER_CREATED', 'order', o.id, { orderId: o.id, status: o.status, branchId: o.branchId }, tx);
            if (options.skipPayment) {
                await this.outbox.publish('ORDER_STATUS_CHANGED', 'order', o.id, { orderId: o.id, status: 'NEW' }, tx);
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
        return { ...full, snapToken: snap.snapToken, clientKey: snap.clientKey, mock: snap.mock };
    }
    async getByPublicToken(token) {
        const order = await this.prisma.order.findUnique({
            where: { publicToken: token },
            include: {
                items: { include: { modifiers: true } },
                payments: true,
                statusHistory: { orderBy: { createdAt: 'asc' } },
                kitchenTickets: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException();
        return order;
    }
    async get(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { modifiers: true } },
                payments: true,
                kitchenTickets: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException();
        return order;
    }
    list(filters) {
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
    async updateStatus(id, toStatus, actorId, reason) {
        const order = await this.get(id);
        const allowed = ORDER_TRANSITIONS[order.status] || [];
        if (!allowed.includes(toStatus)) {
            throw new common_1.BadRequestException(`Cannot transition ${order.status} → ${toStatus}`);
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
            await this.outbox.publish('ORDER_STATUS_CHANGED', 'order', id, { orderId: id, from: order.status, to: toStatus, branchId: order.branchId }, tx);
            if (toStatus === 'CANCELLED') {
                await this.vouchers.release(id, tx);
                await this.loyalty.restoreRedeem(id, tx);
            }
            return o;
        });
        if (toStatus === 'COMPLETED') {
            await this.loyalty.earnForOrder(id);
        }
        return updated;
    }
    async markPaid(orderId) {
        const order = await this.get(orderId);
        if (order.status === 'NEW' || order.status === 'COMPLETED')
            return order;
        if (!['AWAITING_PAYMENT', 'PAYMENT_REVIEW', 'DRAFT'].includes(order.status)) {
            throw new common_1.BadRequestException('Order not awaiting payment');
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
                await this.vouchers.consume(order.voucherId, orderId, order.discountTotal, tx);
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
            await this.outbox.publish('PAYMENT_PAID', 'order', orderId, { orderId, branchId: order.branchId }, tx);
        });
        await this.kitchen.createTicketsForOrder(orderId);
        return this.get(orderId);
    }
    async reorder(publicToken, dto) {
        const prev = await this.getByPublicToken(publicToken);
        if (!prev.tableSessionId)
            throw new common_1.BadRequestException('No table session');
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
    async voidItem(orderId, orderItemId, actorId, reason) {
        const order = await this.get(orderId);
        if (['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(order.status)) {
            throw new common_1.BadRequestException('Cannot void item on closed order');
        }
        const item = order.items.find((i) => i.id === orderItemId);
        if (!item)
            throw new common_1.NotFoundException('Item not found');
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
                    meta: component.meta,
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
    async transferTable(orderId, tableId, actorId) {
        const order = await this.get(orderId);
        const table = await this.prisma.cafeTable.findUnique({ where: { id: tableId } });
        if (!table || table.branchId !== order.branchId) {
            throw new common_1.BadRequestException('Table not in same branch');
        }
        if (table.id !== order.tableId && table.status !== 'AVAILABLE') {
            throw new common_1.BadRequestException('Target table unavailable');
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
                if (!other)
                    await tx.cafeTable.update({ where: { id: order.tableId }, data: { status: 'AVAILABLE' } });
            }
            await this.outbox.publish('ORDER_STATUS_CHANGED', 'order', orderId, {
                orderId, branchId: order.branchId, to: 'TABLE_TRANSFERRED', tableId, actorId,
            }, tx);
        });
        return this.get(orderId);
    }
    async reprint(orderId) {
        const tickets = await this.prisma.kitchenTicket.findMany({ where: { orderId } });
        let n = 0;
        for (const t of tickets) {
            const r = await this.prisma.printJob.updateMany({
                where: { ticketId: t.id },
                data: { status: 'QUEUED', claimedAt: null },
            });
            n += r.count;
            if (!r.count) {
                await this.kitchen.createTicketsForOrder(orderId).catch(() => undefined);
                break;
            }
        }
        return { orderId, reprinted: n || tickets.length };
    }
    async mergeSessions(sourceSessionId, targetSessionId, actorId) {
        if (sourceSessionId === targetSessionId)
            throw new common_1.BadRequestException('Same session');
        const [src, tgt] = await Promise.all([
            this.prisma.tableSession.findUnique({ where: { id: sourceSessionId } }),
            this.prisma.tableSession.findUnique({ where: { id: targetSessionId } }),
        ]);
        if (!src || !tgt || src.branchId !== tgt.branchId) {
            throw new common_1.BadRequestException('Invalid sessions');
        }
        if (['CLOSED', 'CANCELLED'].includes(src.status) || ['CLOSED', 'CANCELLED'].includes(tgt.status)) {
            throw new common_1.BadRequestException('Session closed');
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => kitchen_service_1.KitchenService))),
    __param(8, (0, common_1.Inject)((0, common_1.forwardRef)(() => payments_service_1.PaymentsService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pricing_service_1.PricingService,
        outbox_service_1.OutboxService,
        kitchen_service_1.KitchenService,
        vouchers_service_1.VouchersService,
        promotions_service_1.PromotionsService,
        tips_service_1.TipsService,
        loyalty_service_1.LoyaltyService,
        payments_service_1.PaymentsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map