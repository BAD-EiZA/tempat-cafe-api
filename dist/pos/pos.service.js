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
exports.PosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const orders_service_1 = require("../orders/orders.service");
let PosService = class PosService {
    constructor(prisma, orders) {
        this.prisma = prisma;
        this.orders = orders;
    }
    activeOrders(branchId) {
        return this.prisma.order.findMany({
            where: {
                branchId,
                status: {
                    in: ['NEW', 'ACCEPTED', 'PREPARING', 'PARTIALLY_READY', 'READY', 'SERVED', 'AWAITING_PAYMENT'],
                },
            },
            include: { items: true, payments: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    createManual(dto) {
        return this.orders.checkout({
            ...dto,
            type: dto.type || 'DINE_IN_POS',
        }, { skipPayment: dto.paymentMethod === 'CASH' });
    }
    openShift(branchId, userId, openingCash) {
        return this.prisma.cashShift.create({
            data: { branchId, openedBy: userId, openingCash },
        });
    }
    async closeShift(id, userId, actualCash, notes) {
        const shift = await this.prisma.cashShift.findUnique({ where: { id } });
        if (!shift)
            return null;
        const cashOrders = await this.prisma.order.findMany({
            where: {
                branchId: shift.branchId,
                createdAt: { gte: shift.openedAt },
                status: { notIn: ['CANCELLED', 'AWAITING_PAYMENT', 'DRAFT'] },
                type: { in: ['DINE_IN_POS', 'TAKEAWAY_POS'] },
            },
        });
        const cashSales = cashOrders
            .filter((o) => o.status !== 'AWAITING_PAYMENT')
            .reduce((s, o) => s + o.grandTotal, 0);
        const expected = shift.openingCash + cashSales;
        return this.prisma.cashShift.update({
            where: { id },
            data: {
                closedBy: userId,
                closedAt: new Date(),
                actualCash,
                expectedCash: expected,
                variance: actualCash - expected,
                notes,
            },
        });
    }
    mergeSessions(sourceSessionId, targetSessionId, actorId) {
        return this.orders.mergeSessions(sourceSessionId, targetSessionId, actorId);
    }
    listSessions(branchId) {
        return this.prisma.tableSession.findMany({
            where: {
                branchId,
                status: { in: ['OPEN', 'ACTIVE', 'CHECKOUT_IN_PROGRESS'] },
            },
            include: { table: true, orders: { take: 5, orderBy: { createdAt: 'desc' } } },
            orderBy: { startedAt: 'desc' },
        });
    }
};
exports.PosService = PosService;
exports.PosService = PosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService])
], PosService);
//# sourceMappingURL=pos.service.js.map