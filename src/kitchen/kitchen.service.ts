import { BadRequestException, Injectable, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { KitchenTicketStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OutboxService } from '../outbox/outbox.service';
import { PrintersService } from '../printers/printers.service';
import { OrdersService } from '../orders/orders.service';
import { canTransitionKitchenTicket } from '../common/transaction-integrity';

@Injectable()
export class KitchenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    @Inject(forwardRef(() => PrintersService))
    private readonly printers: PrintersService,
    @Inject(forwardRef(() => OrdersService))
    private readonly orders: OrdersService,
  ) {}

  async createTicketsForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return [];

    const byStation = new Map<string, typeof order.items>();
    const defaultStation = await this.prisma.kitchenStation.findFirst({
      where: { branchId: order.branchId },
      orderBy: { sortOrder: 'asc' },
    });

    for (const item of order.items) {
      const sid = item.stationId || defaultStation?.id;
      if (!sid) continue;
      const arr = byStation.get(sid) || [];
      arr.push(item);
      byStation.set(sid, arr);
    }

    const tickets: any[] = [];
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
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
        created = false;
        ticket = await this.prisma.kitchenTicket.findUniqueOrThrow({
          where: { orderId_stationId: { orderId, stationId } },
          include: { items: true, station: true },
        });
      }
      tickets.push(ticket);
      if (created) await this.outbox.publish('KITCHEN_TICKET_CREATED', 'kitchen_ticket', ticket.id, {
        ticketId: ticket.id,
        orderId,
        stationId,
        branchId: order.branchId,
      });
      if (created) await this.printers.enqueueForTicket(ticket.id);
    }

    await this.prisma.order.updateMany({
      where: { id: orderId, status: { in: ['NEW', 'ACCEPTED'] } },
      data: { status: 'PREPARING' },
    }).catch(() => undefined);

    return tickets;
  }

  listTickets(branchId: string, stationId?: string) {
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

  async updateTicketStatus(id: string, status: KitchenTicketStatus) {
    const current = await this.prisma.kitchenTicket.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Kitchen ticket not found');
    if (!Object.values(KitchenTicketStatus).includes(status)) throw new BadRequestException('Invalid kitchen status');
    if (!canTransitionKitchenTicket(current.status, status)) {
      throw new BadRequestException(`Cannot transition ${current.status} to ${status}`);
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

  private async recomputeOrderKitchenStatus(orderId: string) {
    const tickets = await this.prisma.kitchenTicket.findMany({ where: { orderId } });
    if (!tickets.length) return;
    const allReady = tickets.every((t) => ['READY', 'SERVED', 'CANCELLED'].includes(t.status));
    const someReady = tickets.some((t) => t.status === 'READY' || t.status === 'SERVED');
    if (allReady) {
      await this.orders.updateStatus(orderId, 'READY');
    } else if (someReady) {
      await this.orders.updateStatus(orderId, 'PARTIALLY_READY').catch(() => undefined);
    }
  }
}
