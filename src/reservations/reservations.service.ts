import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TableSessionsService } from '../table-sessions/table-sessions.service';
import { OutboxService } from '../outbox/outbox.service';

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

  async availability(branchId: string, startAt: Date, guestCount: number) {
    const settings = await this.getOrCreateSettings(branchId);
    if (!settings.enabled) return { available: false, slots: [] };

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
    const settings = await this.getOrCreateSettings(dto.branchId);
    const endAt = new Date(startAt.getTime() + settings.slotMinutes * 60_000);
    const avail = await this.availability(dto.branchId, startAt, dto.guestCount);
    if (!avail.available) throw new BadRequestException('No availability');

    const freeTables = avail.tables || [];
    const tableIds = dto.tableIds?.length ? dto.tableIds : freeTables[0] ? [freeTables[0].id] : [];
    if (!tableIds.length) throw new BadRequestException('No tables available');
    const code = `R${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const needsDeposit = settings.depositRequired && (settings.depositAmount || 0) > 0;
    const customerName = dto.customerName || dto.guestName || 'Guest';

    const reservation = await this.prisma.reservation.create({
      data: {
        branchId: dto.branchId,
        code,
        customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail,
        guestCount: dto.guestCount,
        startAt,
        endAt,
        specialRequest: dto.specialRequest,
        depositAmount: needsDeposit ? settings.depositAmount || 0 : 0,
        status: needsDeposit ? 'PENDING_PAYMENT' : 'CONFIRMED',
        tables: { create: tableIds.map((tableId) => ({ tableId })) },
        history: {
          create: { toStatus: needsDeposit ? 'PENDING_PAYMENT' : 'CONFIRMED' },
        },
      },
      include: { tables: true },
    });

    await this.outbox.publish('RESERVATION_CREATED', 'reservation', reservation.id, {
      reservationId: reservation.id,
      branchId: dto.branchId,
    });

    return reservation;
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

  async updateStatus(id: string, status: any, actorId?: string) {
    const r = await this.prisma.reservation.findUnique({
      where: { id },
      include: { tables: true },
    });
    if (!r) throw new NotFoundException();

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

  confirmDeposit(id: string) {
    return this.prisma.reservation.update({
      where: { id },
      data: { depositPaid: true, status: 'CONFIRMED' },
    });
  }
}
