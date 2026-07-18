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
exports.KitchenService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const outbox_service_1 = require("../outbox/outbox.service");
const printers_service_1 = require("../printers/printers.service");
const orders_service_1 = require("../orders/orders.service");
const transaction_integrity_1 = require("../common/transaction-integrity");
let KitchenService = class KitchenService {
    constructor(prisma, outbox, printers, orders) {
        this.prisma = prisma;
        this.outbox = outbox;
        this.printers = printers;
        this.orders = orders;
    }
    async createTicketsForOrder(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order)
            return [];
        const byStation = new Map();
        const defaultStation = await this.prisma.kitchenStation.findFirst({
            where: { branchId: order.branchId },
            orderBy: { sortOrder: 'asc' },
        });
        for (const item of order.items) {
            const sid = item.stationId || defaultStation?.id;
            if (!sid)
                continue;
            const arr = byStation.get(sid) || [];
            arr.push(item);
            byStation.set(sid, arr);
        }
        const tickets = [];
        for (const [stationId, items] of byStation) {
            let created = true;
            let ticket;
            try {
                ticket = await this.prisma.kitchenTicket.create({
                    data: {
                        orderId,
                        stationId,
                        branchId: order.branchId,
                        status: 'QUEUED',
                        items: {
                            create: items.map((i) => ({
                                orderItemId: i.id,
                                quantity: i.quantity,
                                nameSnapshot: i.nameSnapshot,
                                notes: i.notes,
                            })),
                        },
                    },
                    include: { items: true, station: true },
                });
            }
            catch (error) {
                if (!(error instanceof client_1.Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002')
                    throw error;
                created = false;
                ticket = await this.prisma.kitchenTicket.findUniqueOrThrow({
                    where: { orderId_stationId: { orderId, stationId } },
                    include: { items: true, station: true },
                });
            }
            tickets.push(ticket);
            if (created)
                await this.outbox.publish('KITCHEN_TICKET_CREATED', 'kitchen_ticket', ticket.id, {
                    ticketId: ticket.id,
                    orderId,
                    stationId,
                    branchId: order.branchId,
                });
            if (created)
                await this.printers.enqueueForTicket(ticket.id);
        }
        await this.prisma.order.updateMany({
            where: { id: orderId, status: { in: ['NEW', 'ACCEPTED'] } },
            data: { status: 'PREPARING' },
        }).catch(() => undefined);
        return tickets;
    }
    listTickets(branchId, stationId) {
        return this.prisma.kitchenTicket.findMany({
            where: {
                branchId,
                stationId,
                status: { notIn: ['SERVED', 'CANCELLED'] },
            },
            include: { items: true, station: true, order: true },
            orderBy: { queuedAt: 'asc' },
        });
    }
    async updateTicketStatus(id, status) {
        const current = await this.prisma.kitchenTicket.findUnique({ where: { id } });
        if (!current)
            throw new common_1.NotFoundException('Kitchen ticket not found');
        if (!Object.values(client_1.KitchenTicketStatus).includes(status))
            throw new common_1.BadRequestException('Invalid kitchen status');
        if (!(0, transaction_integrity_1.canTransitionKitchenTicket)(current.status, status)) {
            throw new common_1.BadRequestException(`Cannot transition ${current.status} to ${status}`);
        }
        const ticket = await this.prisma.kitchenTicket.update({
            where: { id },
            data: {
                status,
                readyAt: status === 'READY' ? new Date() : undefined,
            },
            include: { order: true },
        });
        await this.outbox.publish('KITCHEN_TICKET_READY', 'kitchen_ticket', id, {
            ticketId: id,
            status,
            orderId: ticket.orderId,
        });
        if (status === 'READY') {
            await this.recomputeOrderKitchenStatus(ticket.orderId);
        }
        return ticket;
    }
    async recomputeOrderKitchenStatus(orderId) {
        const tickets = await this.prisma.kitchenTicket.findMany({ where: { orderId } });
        if (!tickets.length)
            return;
        const allReady = tickets.every((t) => ['READY', 'SERVED', 'CANCELLED'].includes(t.status));
        const someReady = tickets.some((t) => t.status === 'READY' || t.status === 'SERVED');
        if (allReady) {
            await this.orders.updateStatus(orderId, 'READY');
        }
        else if (someReady) {
            await this.orders.updateStatus(orderId, 'PARTIALLY_READY').catch(() => undefined);
        }
    }
};
exports.KitchenService = KitchenService;
exports.KitchenService = KitchenService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => printers_service_1.PrintersService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => orders_service_1.OrdersService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        outbox_service_1.OutboxService,
        printers_service_1.PrintersService,
        orders_service_1.OrdersService])
], KitchenService);
//# sourceMappingURL=kitchen.service.js.map