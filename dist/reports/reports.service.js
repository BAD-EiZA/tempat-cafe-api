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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sales(organizationId, branchId, from, to) {
        const where = {
            organizationId,
            status: { in: ['NEW', 'ACCEPTED', 'PREPARING', 'PARTIALLY_READY', 'READY', 'SERVED', 'COMPLETED'] },
        };
        if (branchId)
            where.branchId = branchId;
        if (from || to) {
            where.createdAt = {};
            if (from)
                where.createdAt.gte = new Date(from);
            if (to)
                where.createdAt.lte = new Date(to);
        }
        const orders = await this.prisma.order.findMany({
            where,
            include: { items: true, payments: true },
        });
        const grossSales = orders.reduce((s, o) => s + o.grandTotal, 0);
        const netSales = orders.reduce((s, o) => s + (o.subtotal - o.discountTotal), 0);
        const orderCount = orders.length;
        const aov = orderCount ? Math.floor(grossSales / orderCount) : 0;
        const taxTotal = orders.reduce((s, o) => s + o.taxTotal, 0);
        const tipTotal = orders.reduce((s, o) => s + o.tipTotal, 0);
        const discountTotal = orders.reduce((s, o) => s + o.discountTotal, 0);
        const refundCount = await this.prisma.order.count({
            where: { ...where, status: 'REFUNDED' },
        });
        const productMap = new Map();
        for (const o of orders) {
            for (const i of o.items) {
                const cur = productMap.get(i.nameSnapshot) || { name: i.nameSnapshot, qty: 0, revenue: 0 };
                cur.qty += i.quantity;
                cur.revenue += i.lineTotal;
                productMap.set(i.nameSnapshot, cur);
            }
        }
        const topProducts = [...productMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 20);
        const hourMap = new Map();
        for (const o of orders) {
            const h = o.createdAt.getHours();
            hourMap.set(h, (hourMap.get(h) || 0) + o.grandTotal);
        }
        const byHour = [...hourMap.entries()]
            .map(([hour, total]) => ({ hour, total }))
            .sort((a, b) => a.hour - b.hour);
        return {
            grossSales,
            netSales,
            orderCount,
            averageOrderValue: aov,
            taxTotal,
            tipTotal,
            discountTotal,
            refundCount,
            topProducts,
            byHour,
        };
    }
    async operations(branchId, from, to) {
        const ticketWhere = { branchId };
        if (from || to) {
            ticketWhere.queuedAt = {};
            if (from)
                ticketWhere.queuedAt.gte = new Date(from);
            if (to)
                ticketWhere.queuedAt.lte = new Date(to);
        }
        const tickets = await this.prisma.kitchenTicket.findMany({ where: ticketWhere });
        const ready = tickets.filter((t) => t.readyAt);
        const avgMs = ready.length === 0
            ? 0
            : ready.reduce((s, t) => s + (t.readyAt.getTime() - t.queuedAt.getTime()), 0) /
                ready.length;
        const reservations = await this.prisma.reservation.groupBy({
            by: ['status'],
            where: { branchId },
            _count: true,
        });
        const feedback = await this.prisma.feedback.aggregate({
            where: { order: { branchId } },
            _avg: { overallRating: true },
            _count: true,
        });
        return {
            ticketCount: tickets.length,
            avgProductionMinutes: Math.round((avgMs / 60_000) * 10) / 10,
            reservations,
            feedback: {
                count: feedback._count,
                avgRating: feedback._avg.overallRating,
            },
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map