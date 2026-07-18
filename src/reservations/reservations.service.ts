import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TableSessionsService } from '../table-sessions/table-sessions.service';
import { OutboxService } from '../outbox/outbox.service';

const RESERVATION_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
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

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: TableSessionsService,
    private readonly outbox: OutboxService,
  ) {}

  async getOrCreateSettings(branchId: string) {
    let s = await this.prisma.reservationSetting.findUnique({ where: { branchId } });
    if (!s) {
      s = await this.prisma.reservationSetting.create({ data: { branchId } });
    }
    return s;
  }

  updateSettings(branchId: string, dto: Record<string, unknown>) {
    return this.prisma.reservationSetting.upsert({
      where: { branchId },
      create: { branchId, ...(dto as any) },
      update: dto as any,
    });
  }

  private async validateRequest(
    branchId: string,
    startAt: Date,
    guestCount: number,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const settings = await client.reservationSetting.upsert({
      where: { branchId },
      create: { branchId },
      update: {},
    });
    if (!settings.enabled) throw new BadRequestException('Reservations are disabled');
    if (!Number.isInteger(guestCount) || guestCount < settings.minGuests || guestCount > settings.maxGuests) {
      throw new BadRequestException(`Guest count must be between ${settings.minGuests} and ${settings.maxGuests}`);
    }
    if (Number.isNaN(startAt.getTime())) throw new BadRequestException('Invalid startAt');
    if (startAt.getTime() < Date.now() + settings.cutoffMinutes * 60_000) {
      throw new BadRequestException(`Reservation must be at least ${settings.cutoffMinutes} minutes in advance`);
    }
    return settings;
  }

  private expirePending(
    branchId: string,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
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

  async availability(branchId: string, startAt: Date, guestCount: number) {
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

  async create(dto: {
    branchId: string;
    customerName?: string;
    guestName?: string;
    customerPhone?: string;
    guestPhone?: string;
    customerEmail?: string;
    guestCount: number;
    startAt: string;
    tableIds?: string[];
    specialRequest?: string;
    notes?: string;
  }) {
    dto = {
      ...dto,
      customerName: dto.customerName || dto.guestName || 'Guest',
      customerPhone: dto.customerPhone || dto.guestPhone,
      specialRequest: dto.specialRequest || dto.notes,
    };
    const startAt = new Date(dto.startAt);
    if (Number.isNaN(startAt.getTime())) throw new BadRequestException('Invalid startAt');
    const requestedTableIds = [...new Set(dto.tableIds || [])];
    if (requestedTableIds.length !== (dto.tableIds?.length || 0)) {
      throw new BadRequestException('Duplicate tableIds');
    }

    return this.prisma.$transaction(
      async (tx) => {
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
          throw new BadRequestException('All tables must exist, be enabled, and belong to the branch');
        }
        if (requestedTableIds.length && tables.reduce((sum, table) => sum + table.capacity, 0) < dto.guestCount) {
          throw new BadRequestException('Selected tables do not have enough capacity');
        }

        const selectedTables = requestedTableIds.length
          ? tables
          : tables.filter((table) => !table.reservations.length && !table.blocks.length).slice(0, 1);
        if (!selectedTables.length || selectedTables.some((table) => table.reservations.length || table.blocks.length)) {
          throw new BadRequestException('Selected tables are not available');
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

        await this.outbox.publish(
          'RESERVATION_CREATED',
          'reservation',
          reservation.id,
          { reservationId: reservation.id, branchId: dto.branchId },
          tx,
        );
        return {
          ...reservation,
          paymentRequired: needsDeposit,
          paymentExpiresAt: needsDeposit
            ? new Date(reservation.createdAt.getTime() + PAYMENT_HOLD_MINUTES * 60_000)
            : null,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  list(branchId: string, from?: string, to?: string) {
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

  async updateStatus(id: string, status: ReservationStatus, actorId?: string) {
    const r = await this.prisma.reservation.findUnique({
      where: { id },
      include: { tables: true },
    });
    if (!r) throw new NotFoundException();
    if (!Object.values(ReservationStatus).includes(status)) {
      throw new BadRequestException('Invalid reservation status');
    }
    if (r.status === status) return r;
    if (!RESERVATION_TRANSITIONS[r.status].includes(status)) {
      throw new BadRequestException(`Cannot transition ${r.status} to ${status}`);
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

  async confirmDeposit(id: string, actorId?: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException();
    if (reservation.depositPaid && reservation.status === 'CONFIRMED') return reservation;
    if (reservation.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Reservation is not awaiting deposit');
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
}
