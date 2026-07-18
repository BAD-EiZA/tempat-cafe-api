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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const table_sessions_service_1 = require("../table-sessions/table-sessions.service");
const outbox_service_1 = require("../outbox/outbox.service");
const RESERVATION_TRANSITIONS = {
    PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
    CONFIRMED: ['CHECKED_IN', 'SEATED', 'CANCELLED', 'NO_SHOW'],
    CHECKED_IN: ['SEATED', 'COMPLETED', 'CANCELLED'],
    SEATED: ['COMPLETED'],
    CANCELLED: [],
    EXPIRED: [],
    COMPLETED: [],
    NO_SHOW: [],
};
const PAYMENT_HOLD_MINUTES = 30;
let ReservationsService = class ReservationsService {
    constructor(prisma, sessions, outbox) {
        this.prisma = prisma;
        this.sessions = sessions;
        this.outbox = outbox;
    }
    async getOrCreateSettings(branchId) {
        let s = await this.prisma.reservationSetting.findUnique({ where: { branchId } });
        if (!s) {
            s = await this.prisma.reservationSetting.create({ data: { branchId } });
        }
        return s;
    }
    updateSettings(branchId, dto) {
        return this.prisma.reservationSetting.upsert({
            where: { branchId },
            create: { branchId, ...dto },
            update: dto,
        });
    }
    async validateRequest(branchId, startAt, guestCount, client = this.prisma) {
        const settings = await client.reservationSetting.upsert({
            where: { branchId },
            create: { branchId },
            update: {},
        });
        if (!settings.enabled)
            throw new common_1.BadRequestException('Reservations are disabled');
        if (!Number.isInteger(guestCount) || guestCount < settings.minGuests || guestCount > settings.maxGuests) {
            throw new common_1.BadRequestException(`Guest count must be between ${settings.minGuests} and ${settings.maxGuests}`);
        }
        if (Number.isNaN(startAt.getTime()))
            throw new common_1.BadRequestException('Invalid startAt');
        if (startAt.getTime() < Date.now() + settings.cutoffMinutes * 60_000) {
            throw new common_1.BadRequestException(`Reservation must be at least ${settings.cutoffMinutes} minutes in advance`);
        }
        return settings;
    }
    expirePending(branchId, client = this.prisma) {
        return client.reservation.updateMany({
            where: {
                branchId,
                status: 'PENDING_PAYMENT',
                depositPaid: false,
                createdAt: { lte: new Date(Date.now() - PAYMENT_HOLD_MINUTES * 60_000) },
            },
            data: { status: 'EXPIRED' },
        });
    }
    async availability(branchId, startAt, guestCount) {
        const settings = await this.validateRequest(branchId, startAt, guestCount);
        await this.expirePending(branchId);
        const endAt = new Date(startAt.getTime() + settings.slotMinutes * 60_000);
        const tables = await this.prisma.cafeTable.findMany({
            where: {
                branchId,
                status: { not: 'DISABLED' },
                capacity: { gte: guestCount },
            },
            include: {
                reservations: {
                    where: {
                        reservation: {
                            status: { in: ['CONFIRMED', 'CHECKED_IN', 'SEATED', 'PENDING_PAYMENT'] },
                            startAt: { lt: endAt },
                            endAt: { gt: startAt },
                        },
                    },
                },
                blocks: {
                    where: { startAt: { lt: endAt }, endAt: { gt: startAt } },
                },
            },
        });
        const free = tables.filter((t) => !t.reservations.length && !t.blocks.length);
        return {
            available: free.length > 0,
            depositRequired: settings.depositRequired,
            depositAmount: settings.depositAmount,
            tables: free.map((t) => ({ id: t.id, name: t.name, capacity: t.capacity })),
            slot: { startAt, endAt },
        };
    }
    async create(dto) {
        dto = {
            ...dto,
            customerName: dto.customerName || dto.guestName || 'Guest',
            customerPhone: dto.customerPhone || dto.guestPhone,
            specialRequest: dto.specialRequest || dto.notes,
        };
        const startAt = new Date(dto.startAt);
        if (Number.isNaN(startAt.getTime()))
            throw new common_1.BadRequestException('Invalid startAt');
        const requestedTableIds = [...new Set(dto.tableIds || [])];
        if (requestedTableIds.length !== (dto.tableIds?.length || 0)) {
            throw new common_1.BadRequestException('Duplicate tableIds');
        }
        return this.prisma.$transaction(async (tx) => {
            const settings = await this.validateRequest(dto.branchId, startAt, dto.guestCount, tx);
            await this.expirePending(dto.branchId, tx);
            const endAt = new Date(startAt.getTime() + settings.slotMinutes * 60_000);
            const tables = await tx.cafeTable.findMany({
                where: {
                    branchId: dto.branchId,
                    status: { not: 'DISABLED' },
                    ...(requestedTableIds.length
                        ? { id: { in: requestedTableIds } }
                        : { capacity: { gte: dto.guestCount } }),
                },
                include: {
                    reservations: {
                        where: {
                            reservation: {
                                status: { in: ['CONFIRMED', 'CHECKED_IN', 'SEATED', 'PENDING_PAYMENT'] },
                                startAt: { lt: endAt },
                                endAt: { gt: startAt },
                            },
                        },
                    },
                    blocks: { where: { startAt: { lt: endAt }, endAt: { gt: startAt } } },
                },
            });
            if (requestedTableIds.length && tables.length !== requestedTableIds.length) {
                throw new common_1.BadRequestException('All tables must exist, be enabled, and belong to the branch');
            }
            if (requestedTableIds.length && tables.reduce((sum, table) => sum + table.capacity, 0) < dto.guestCount) {
                throw new common_1.BadRequestException('Selected tables do not have enough capacity');
            }
            const selectedTables = requestedTableIds.length
                ? tables
                : tables.filter((table) => !table.reservations.length && !table.blocks.length).slice(0, 1);
            if (!selectedTables.length || selectedTables.some((table) => table.reservations.length || table.blocks.length)) {
                throw new common_1.BadRequestException('Selected tables are not available');
            }
            const needsDeposit = settings.depositRequired && (settings.depositAmount || 0) > 0;
            const reservation = await tx.reservation.create({
                data: {
                    branchId: dto.branchId,
                    code: `R${Date.now().toString(36).toUpperCase().slice(-6)}`,
                    customerName: dto.customerName || dto.guestName || 'Guest',
                    customerPhone: dto.customerPhone,
                    customerEmail: dto.customerEmail,
                    guestCount: dto.guestCount,
                    startAt,
                    endAt,
                    specialRequest: dto.specialRequest,
                    depositAmount: needsDeposit ? settings.depositAmount || 0 : 0,
                    status: needsDeposit ? 'PENDING_PAYMENT' : 'CONFIRMED',
                    tables: { create: selectedTables.map((table) => ({ tableId: table.id })) },
                    history: { create: { toStatus: needsDeposit ? 'PENDING_PAYMENT' : 'CONFIRMED' } },
                },
                include: { tables: true },
            });
            await this.outbox.publish('RESERVATION_CREATED', 'reservation', reservation.id, { reservationId: reservation.id, branchId: dto.branchId }, tx);
            return {
                ...reservation,
                paymentRequired: needsDeposit,
                paymentExpiresAt: needsDeposit
                    ? new Date(reservation.createdAt.getTime() + PAYMENT_HOLD_MINUTES * 60_000)
                    : null,
            };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
    }
    list(branchId, from, to) {
        return this.prisma.reservation.findMany({
            where: {
                branchId,
                startAt: {
                    gte: from ? new Date(from) : undefined,
                    lte: to ? new Date(to) : undefined,
                },
            },
            include: { tables: { include: { table: true } } },
            orderBy: { startAt: 'asc' },
        });
    }
    async updateStatus(id, status, actorId) {
        const r = await this.prisma.reservation.findUnique({
            where: { id },
            include: { tables: true },
        });
        if (!r)
            throw new common_1.NotFoundException();
        if (!Object.values(client_1.ReservationStatus).includes(status)) {
            throw new common_1.BadRequestException('Invalid reservation status');
        }
        if (r.status === status)
            return r;
        if (!RESERVATION_TRANSITIONS[r.status].includes(status)) {
            throw new common_1.BadRequestException(`Cannot transition ${r.status} to ${status}`);
        }
        const updated = await this.prisma.reservation.update({
            where: { id },
            data: { status },
        });
        await this.prisma.reservationStatusHistory.create({
            data: {
                reservationId: id,
                fromStatus: r.status,
                toStatus: status,
                actorId,
            },
        });
        if (status === 'CHECKED_IN' || status === 'SEATED') {
            const tableId = r.tables[0]?.tableId;
            if (tableId) {
                await this.sessions.open({
                    branchId: r.branchId,
                    tableId,
                    displayName: r.customerName,
                });
                await this.prisma.cafeTable.update({
                    where: { id: tableId },
                    data: { status: 'OCCUPIED' },
                });
            }
        }
        return updated;
    }
    async confirmDeposit(id, actorId) {
        const reservation = await this.prisma.reservation.findUnique({ where: { id } });
        if (!reservation)
            throw new common_1.NotFoundException();
        if (reservation.depositPaid && reservation.status === 'CONFIRMED')
            return reservation;
        if (reservation.status !== 'PENDING_PAYMENT') {
            throw new common_1.BadRequestException('Reservation is not awaiting deposit');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.reservation.update({
                where: { id },
                data: { depositPaid: true, status: 'CONFIRMED' },
            });
            await tx.reservationStatusHistory.create({
                data: { reservationId: id, fromStatus: reservation.status, toStatus: 'CONFIRMED', actorId },
            });
            return updated;
        });
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        table_sessions_service_1.TableSessionsService,
        outbox_service_1.OutboxService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map