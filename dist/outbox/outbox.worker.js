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
var OutboxWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxWorker = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const outbox_service_1 = require("./outbox.service");
const notifications_service_1 = require("../notifications/notifications.service");
const orders_service_1 = require("../orders/orders.service");
const ledger_service_1 = require("../ledger/ledger.service");
const realtime_hub_1 = require("../realtime/realtime.hub");
let OutboxWorker = OutboxWorker_1 = class OutboxWorker {
    constructor(outbox, prisma, notifications, orders, ledger, realtime) {
        this.outbox = outbox;
        this.prisma = prisma;
        this.notifications = notifications;
        this.orders = orders;
        this.ledger = ledger;
        this.realtime = realtime;
        this.log = new common_1.Logger(OutboxWorker_1.name);
        this.running = false;
    }
    onModuleInit() {
        this.timer = setInterval(() => this.tick(), 2500);
        this.settleTimer = setInterval(() => this.settle(), 60_000);
        this.reminderTimer = setInterval(() => this.reservationReminders(), 120_000);
    }
    onModuleDestroy() {
        if (this.timer)
            clearInterval(this.timer);
        if (this.settleTimer)
            clearInterval(this.settleTimer);
        if (this.reminderTimer)
            clearInterval(this.reminderTimer);
    }
    async processOnce() {
        await this.processOutbox();
        await this.expireUnpaid();
        await this.settle();
        await this.reservationReminders();
    }
    async reservationReminders() {
        const soon = new Date(Date.now() + 2 * 3600_000);
        const now = new Date();
        const list = await this.prisma.reservation.findMany({
            where: {
                status: 'CONFIRMED',
                startAt: { gte: now, lte: soon },
            },
            take: 50,
        });
        for (const r of list) {
            const key = `reminder:${r.id}`;
            const exists = await this.prisma.outboxEvent.findFirst({
                where: { aggregateId: r.id, eventType: 'RESERVATION_REMINDER' },
            });
            if (exists)
                continue;
            await this.outbox.publish('RESERVATION_REMINDER', 'reservation', r.id, {
                reservationId: r.id,
                branchId: r.branchId,
                customerName: r.customerName,
                customerPhone: r.customerPhone,
                startAt: r.startAt,
                key,
            });
            this.realtime.publish({
                type: 'RESERVATION_REMINDER',
                branchId: r.branchId,
                payload: { reservationId: r.id, startAt: r.startAt, customerName: r.customerName },
            });
            const members = await this.prisma.organizationMember.findMany({
                where: {
                    organization: { branches: { some: { id: r.branchId } } },
                    role: { code: { in: ['OWNER', 'BRANCH_MANAGER'] } },
                },
                take: 10,
            });
            for (const m of members) {
                await this.notifications.create(m.userId, 'RESERVATION_REMINDER', `Reservasi ${r.customerName}`, `Check-in ~${new Date(r.startAt).toLocaleString('id-ID')}`, { reservationId: r.id });
            }
        }
    }
    async tick() {
        if (this.running)
            return;
        this.running = true;
        try {
            await this.processOutbox();
            await this.expireUnpaid().catch((e) => this.log.warn(`expire: ${e.message}`));
        }
        finally {
            this.running = false;
        }
    }
    async settle() {
        try {
            const hours = Number(process.env.SETTLEMENT_HOURS || 24);
            await this.ledger.settlePending(hours);
        }
        catch (e) {
            this.log.warn(`settle: ${e?.message}`);
        }
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
    }
    async processOutbox() {
        const events = await this.outbox.claimPending(40);
        for (const event of events) {
            try {
                await this.handle(event);
                await this.outbox.markProcessed(event.id);
            }
            catch (e) {
                this.log.warn(`outbox ${event.id} failed: ${e?.message}`);
                await this.outbox.markFailed(event.id, (event.attempts || 0) + 1);
            }
        }
    }
    async handle(event) {
        const payload = (event.payload || {});
        let branchId = payload.branchId;
        const orderId = (payload.orderId || event.aggregateId);
        if (!branchId && orderId) {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                select: { branchId: true, organizationId: true },
            });
            branchId = order?.branchId;
        }
        this.realtime.publish({
            type: event.eventType,
            branchId,
            payload: { orderId, ...payload },
        });
        if ([
            'ORDER_CREATED',
            'PAYMENT_PAID',
            'ORDER_STATUS_CHANGED',
            'KITCHEN_TICKET_CREATED',
            'PRINT_JOB_CREATED',
            'RESERVATION_REMINDER',
        ].includes(event.eventType)) {
            const members = branchId
                ? await this.prisma.branchMember.findMany({
                    where: { branchId },
                    select: { userId: true },
                })
                : [];
            let orgMembers = [];
            if (!members.length && orderId) {
                const order = await this.prisma.order.findUnique({
                    where: { id: orderId },
                    select: { organizationId: true },
                });
                if (order) {
                    orgMembers = await this.prisma.organizationMember.findMany({
                        where: { organizationId: order.organizationId },
                        select: { userId: true },
                    });
                }
            }
            const userIds = [...new Set([...members, ...orgMembers].map((m) => m.userId))];
            const title = event.eventType === 'PAYMENT_PAID'
                ? 'Pembayaran berhasil'
                : event.eventType === 'ORDER_CREATED'
                    ? 'Pesanan baru'
                    : event.eventType === 'KITCHEN_TICKET_CREATED'
                        ? 'Tiket dapur baru'
                        : event.eventType === 'PRINT_JOB_CREATED'
                            ? 'Print job baru'
                            : 'Status pesanan berubah';
            for (const userId of userIds.slice(0, 20)) {
                await this.notifications.create(userId, event.eventType, title, undefined, {
                    orderId,
                    branchId,
                    ...payload,
                });
            }
        }
    }
};
exports.OutboxWorker = OutboxWorker;
exports.OutboxWorker = OutboxWorker = OutboxWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => orders_service_1.OrdersService))),
    __metadata("design:paramtypes", [outbox_service_1.OutboxService,
        prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        orders_service_1.OrdersService,
        ledger_service_1.LedgerService,
        realtime_hub_1.RealtimeHub])
], OutboxWorker);
//# sourceMappingURL=outbox.worker.js.map