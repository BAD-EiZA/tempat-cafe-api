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
exports.TableSessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const outbox_service_1 = require("../outbox/outbox.service");
let TableSessionsService = class TableSessionsService {
    constructor(prisma, outbox) {
        this.prisma = prisma;
        this.outbox = outbox;
    }
    async open(dto) {
        const table = await this.prisma.cafeTable.findUnique({ where: { id: dto.tableId } });
        if (!table || table.branchId !== dto.branchId) {
            throw new common_1.NotFoundException('Table not found');
        }
        const existing = await this.prisma.tableSession.findFirst({
            where: {
                tableId: dto.tableId,
                status: { in: ['OPEN', 'ACTIVE', 'CHECKOUT_IN_PROGRESS'] },
            },
        });
        if (existing) {
            if (dto.joinExisting !== false) {
                const participant = await this.prisma.tableSessionParticipant.findFirst({
                    where: {
                        tableSessionId: existing.id,
                        ...(dto.customerId ? { customerId: dto.customerId } : { displayName: dto.displayName || 'Guest' }),
                    },
                });
                if (!participant) {
                    await this.prisma.tableSessionParticipant.create({
                        data: {
                            tableSessionId: existing.id,
                            customerId: dto.customerId,
                            displayName: dto.displayName || 'Guest',
                        },
                    });
                }
                return this.prisma.tableSession.findUnique({
                    where: { id: existing.id },
                    include: { participants: true, table: true },
                });
            }
            throw new common_1.BadRequestException('Active session exists');
        }
        const session = await this.prisma.$transaction(async (tx) => {
            const s = await tx.tableSession.create({
                data: {
                    branchId: dto.branchId,
                    tableId: dto.tableId,
                    status: 'OPEN',
                    customerInitiatorId: dto.customerId,
                    participants: {
                        create: {
                            customerId: dto.customerId,
                            displayName: dto.displayName || 'Guest',
                        },
                    },
                },
                include: { participants: true, table: true },
            });
            await tx.cafeTable.update({
                where: { id: dto.tableId },
                data: { status: 'OCCUPIED' },
            });
            await this.outbox.publish('TABLE_SESSION_OPENED', 'table_session', s.id, { sessionId: s.id, tableId: dto.tableId, branchId: dto.branchId }, tx);
            return s;
        });
        return session;
    }
    async get(id) {
        const s = await this.prisma.tableSession.findUnique({
            where: { id },
            include: {
                participants: true,
                table: true,
                orders: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!s)
            throw new common_1.NotFoundException();
        return s;
    }
    async close(id) {
        const s = await this.prisma.tableSession.findUnique({
            where: { id },
            include: { orders: true },
        });
        if (!s)
            throw new common_1.NotFoundException();
        const openOrders = s.orders.filter((o) => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status));
        if (openOrders.length) {
            throw new common_1.BadRequestException('Open orders remain');
        }
        return this.prisma.$transaction(async (tx) => {
            const closed = await tx.tableSession.update({
                where: { id },
                data: { status: 'CLOSED', closedAt: new Date() },
            });
            await tx.cafeTable.update({
                where: { id: s.tableId },
                data: { status: 'NEEDS_CLEANING' },
            });
            return closed;
        });
    }
};
exports.TableSessionsService = TableSessionsService;
exports.TableSessionsService = TableSessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        outbox_service_1.OutboxService])
], TableSessionsService);
//# sourceMappingURL=table-sessions.service.js.map