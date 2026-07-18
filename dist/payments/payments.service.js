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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const midtrans_service_1 = require("../midtrans/midtrans.service");
const orders_service_1 = require("../orders/orders.service");
const ledger_service_1 = require("../ledger/ledger.service");
const config_1 = require("@nestjs/config");
const tenant_1 = require("../common/tenant");
const transaction_security_1 = require("./transaction-security");
const transaction_integrity_1 = require("../common/transaction-integrity");
let PaymentsService = class PaymentsService {
    constructor(prisma, midtrans, orders, ledger, config) {
        this.prisma = prisma;
        this.midtrans = midtrans;
        this.orders = orders;
        this.ledger = ledger;
        this.config = config;
    }
    async assertPaymentAccess(orderId, publicToken, user) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (publicToken && order.publicToken === publicToken)
            return order;
        if (user) {
            if ((0, tenant_1.isPlatformAdmin)(user) || user.organizationIds.includes(order.organizationId)) {
                return order;
            }
            throw new common_1.ForbiddenException('No access to this order payment');
        }
        throw new common_1.ForbiddenException('publicToken or auth required');
    }
    async createSnapForOrder(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                payments: true,
                items: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException();
        if (order.status !== 'AWAITING_PAYMENT' && order.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Order not awaiting payment');
        }
        const org = await this.prisma.organization.findUnique({
            where: { id: order.organizationId },
        });
        const midtransLive = this.midtrans.isEnabled;
        if (midtransLive && org && org.status !== 'APPROVED') {
            throw new common_1.BadRequestException('Merchant not approved for live payments');
        }
        const existing = order.payments.find((p) => p.status === 'PENDING' && p.snapToken);
        if (existing) {
            return {
                payment: existing,
                snapToken: existing.snapToken,
                clientKey: this.midtrans.clientKey || 'mock',
                mock: !midtransLive,
            };
        }
        const expiredAt = new Date(Date.now() + 30 * 60_000);
        const providerOrderId = `ORD-${order.id.replace(/-/g, '').slice(0, 24)}-${Date.now()}`;
        const payment = await this.prisma.payment.create({
            data: {
                orderId: order.id,
                organizationId: order.organizationId,
                branchId: order.branchId,
                amount: order.grandTotal,
                status: 'PENDING',
                provider: 'MIDTRANS',
                providerOrderId,
                expiredAt,
            },
        });
        if (!midtransLive) {
            const snapToken = `mock-snap-${payment.id}`;
            const updated = await this.prisma.payment.update({
                where: { id: payment.id },
                data: { snapToken, status: 'PENDING' },
            });
            return { payment: updated, snapToken, clientKey: 'mock', mock: true };
        }
        const itemDetails = [
            {
                id: order.id.slice(0, 50),
                name: `Order ${order.orderNumber}`.slice(0, 50),
                price: order.grandTotal,
                quantity: 1,
            },
        ];
        const snap = await this.midtrans.createSnapToken({
            orderId: providerOrderId,
            amount: order.grandTotal,
            customerName: order.customerName || 'Guest',
            customerEmail: order.customerEmail || undefined,
            customerPhone: order.customerPhone || undefined,
            itemDetails,
        });
        const updated = await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                snapToken: snap.token,
                snapRedirectUrl: snap.redirect_url,
            },
        });
        return { payment: updated, snapToken: snap.token, clientKey: this.midtrans.clientKey };
    }
    async handleMidtransWebhook(payload) {
        const fingerprint = (0, crypto_1.createHash)('sha256')
            .update(JSON.stringify({
            order_id: payload.order_id,
            transaction_status: payload.transaction_status,
            status_code: payload.status_code,
            gross_amount: payload.gross_amount,
            transaction_id: payload.transaction_id,
        }))
            .digest('hex');
        const existingEvent = await this.prisma.paymentEvent.findUnique({
            where: { fingerprint },
        });
        if (existingEvent?.processedAt) {
            return { ok: true, duplicate: true };
        }
        if (this.midtrans.isEnabled && !this.midtrans.verifySignature(payload)) {
            throw new common_1.BadRequestException('Invalid signature');
        }
        const payment = await this.prisma.payment.findFirst({
            where: {
                OR: [
                    { providerOrderId: payload.order_id },
                    { providerTxId: payload.transaction_id },
                ],
            },
        });
        await this.prisma.paymentEvent.create({
            data: {
                paymentId: payment?.id,
                providerTxId: payload.transaction_id,
                eventType: payload.transaction_status || 'unknown',
                fingerprint,
                rawPayload: payload,
                status: 'RECEIVED',
            },
        });
        if (!payment)
            return { ok: true, unmatched: true };
        let status = payload.transaction_status;
        if (this.midtrans.isEnabled && payload.order_id) {
            try {
                const remote = await this.midtrans.getStatus(payload.order_id);
                status = remote.transaction_status || status;
            }
            catch {
            }
        }
        const mapped = this.mapStatus(status, payload.fraud_status);
        if (payment.status === 'PAID' && mapped === 'PAID') {
            await this.prisma.paymentEvent.updateMany({
                where: { fingerprint },
                data: { processedAt: new Date(), status: 'PROCESSED' },
            });
            return { ok: true, alreadyPaid: true };
        }
        if (mapped === 'PAID') {
            const gross = Number(payload.gross_amount);
            if (!(0, transaction_security_1.paymentAmountMatches)(payload.gross_amount, payment.amount)) {
                await this.prisma.reconciliationRecord.create({
                    data: {
                        paymentId: payment.id,
                        status: 'AMOUNT_mismatch',
                        internalAmount: payment.amount,
                        providerAmount: Number.isFinite(gross) ? Math.round(gross) : 0,
                        providerTxId: payload.transaction_id,
                        notes: 'gross_amount != payment.amount',
                    },
                }).catch(() => undefined);
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'ERROR',
                        providerTxId: payload.transaction_id || payment.providerTxId,
                        method: payload.payment_type,
                    },
                });
                const order = await this.prisma.order.findUnique({ where: { id: payment.orderId } });
                if (order?.status === 'AWAITING_PAYMENT') {
                    await this.orders.updateStatus(order.id, 'PAYMENT_REVIEW', undefined, 'gross_amount_mismatch');
                }
                await this.prisma.paymentEvent.updateMany({
                    where: { fingerprint },
                    data: { processedAt: new Date(), status: 'PROCESSED' },
                });
                return { ok: true, status: 'PAYMENT_REVIEW' };
            }
        }
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: mapped,
                providerTxId: payload.transaction_id || payment.providerTxId,
                method: payload.payment_type,
                paidAt: mapped === 'PAID' ? new Date() : payment.paidAt,
            },
        });
        if (mapped === 'PAID') {
            await this.orders.markPaid(payment.orderId);
            await this.ledger.postSale(payment.id);
        }
        else if (mapped === 'EXPIRED' || mapped === 'CANCELLED') {
            const order = await this.prisma.order.findUnique({ where: { id: payment.orderId } });
            if (order?.status === 'AWAITING_PAYMENT') {
                await this.orders.updateStatus(order.id, 'CANCELLED', undefined, `payment_${mapped.toLowerCase()}`);
            }
        }
        await this.prisma.paymentEvent.updateMany({
            where: { fingerprint },
            data: { processedAt: new Date(), status: 'PROCESSED' },
        });
        return { ok: true, status: mapped };
    }
    mapStatus(txStatus, fraud) {
        if (txStatus === 'capture') {
            return fraud === 'challenge' ? 'AUTHORIZED' : 'PAID';
        }
        if (txStatus === 'settlement')
            return 'PAID';
        if (txStatus === 'pending')
            return 'PENDING';
        if (txStatus === 'deny')
            return 'DENIED';
        if (txStatus === 'expire')
            return 'EXPIRED';
        if (txStatus === 'cancel')
            return 'CANCELLED';
        if (txStatus === 'refund')
            return 'REFUNDED';
        if (txStatus === 'partial_refund')
            return 'PARTIALLY_REFUNDED';
        return 'ERROR';
    }
    async mockPay(paymentId) {
        const nodeEnv = this.config.get('NODE_ENV');
        if (nodeEnv === 'production' || this.midtrans.isEnabled) {
            throw new common_1.BadRequestException('Mock pay disabled');
        }
        if (this.config.get('ALLOW_MOCK_PAY') === 'false') {
            throw new common_1.BadRequestException('Mock pay disabled');
        }
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment)
            throw new common_1.NotFoundException();
        if (payment.status === 'PAID')
            return { ok: true, alreadyPaid: true };
        return this.handleMidtransWebhook({
            order_id: payment.providerOrderId,
            transaction_id: `mock-tx-${payment.id}`,
            transaction_status: 'settlement',
            status_code: '200',
            gross_amount: String(payment.amount),
            payment_type: 'qris',
        });
    }
    async expireUnpaid() {
        const now = new Date();
        const expired = await this.prisma.payment.findMany({
            where: {
                status: 'PENDING',
                OR: [
                    { expiredAt: { lte: now } },
                    { expiredAt: null, createdAt: { lte: new Date(now.getTime() - 30 * 60_000) } },
                ],
            },
            take: 50,
        });
        for (const p of expired) {
            await this.prisma.payment.update({
                where: { id: p.id },
                data: { status: 'EXPIRED' },
            });
            const order = await this.prisma.order.findUnique({ where: { id: p.orderId } });
            if (order?.status === 'AWAITING_PAYMENT') {
                await this.orders.updateStatus(order.id, 'CANCELLED', undefined, 'payment_expired');
            }
        }
        return { expired: expired.length };
    }
    async getStatus(paymentId) {
        const p = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!p)
            throw new common_1.NotFoundException();
        return p;
    }
    async requestRefund(paymentId, amount, reason, userId, idempotencyKey) {
        if (!(0, transaction_integrity_1.isValidRefundAmount)(amount))
            throw new common_1.BadRequestException('Amount must be a positive integer');
        const result = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.refund.findUnique({ where: { idempotencyKey } });
            if (existing)
                return { refund: existing, created: false };
            const rows = await tx.$queryRaw `
        SELECT amount, status, provider_order_id FROM payments WHERE id = ${paymentId}::uuid FOR UPDATE
      `;
            const payment = rows[0];
            if (!payment || !['PAID', 'PARTIALLY_REFUNDED'].includes(payment.status)) {
                throw new common_1.BadRequestException('Payment not refundable');
            }
            const aggregate = await tx.refund.aggregate({
                where: { paymentId, status: { in: ['PENDING', 'COMPLETED'] } },
                _sum: { amount: true },
            });
            if (amount > payment.amount - (aggregate._sum.amount || 0)) {
                throw new common_1.BadRequestException('Amount exceeds refundable balance');
            }
            const refund = await tx.refund.create({
                data: { paymentId, amount, reason, status: 'PENDING', idempotencyKey, requestedBy: userId },
            });
            return { refund, created: true };
        });
        const { refund } = result;
        if (!result.created)
            return refund;
        const payment = await this.prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
        if (this.midtrans.isEnabled && payment.providerOrderId) {
            try {
                await this.midtrans.refund(payment.providerOrderId, amount, reason);
            }
            catch (e) {
                await this.prisma.refund.update({
                    where: { id: refund.id },
                    data: { status: 'FAILED' },
                });
                throw new common_1.BadRequestException(e?.message || 'Midtrans refund failed');
            }
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.refund.update({ where: { id: refund.id }, data: { status: 'COMPLETED' } });
            const completed = await tx.refund.aggregate({
                where: { paymentId, status: 'COMPLETED' }, _sum: { amount: true },
            });
            await tx.payment.update({
                where: { id: paymentId },
                data: { status: (completed._sum.amount || 0) >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED' },
            });
        });
        await this.ledger.postRefund(paymentId, amount, refund.id);
        return refund;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => orders_service_1.OrdersService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        midtrans_service_1.MidtransService,
        orders_service_1.OrdersService,
        ledger_service_1.LedgerService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map