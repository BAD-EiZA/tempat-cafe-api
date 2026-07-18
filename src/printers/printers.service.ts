import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { OutboxService } from '../outbox/outbox.service';

@Injectable()
export class PrintersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  createDevice(dto: {
    branchId: string;
    name: string;
    type?: string;
    host?: string;
    port?: number;
  }) {
    return this.prisma.printerDevice.create({ data: dto as any });
  }

  mapStation(printerId: string, stationId: string, isPrimary = true, copies = 1) {
    return this.prisma.printerStationMapping.create({
      data: { printerId, stationId, isPrimary, copies },
    });
  }

  async registerAgent(branchId: string, name: string) {
    const deviceToken = randomBytes(24).toString('hex');
    return this.prisma.printerAgent.create({
      data: { branchId, name, deviceToken, isOnline: true, lastHeartbeat: new Date() },
    });
  }

  async heartbeat(deviceToken: string) {
    const agent = await this.prisma.printerAgent.findUnique({ where: { deviceToken } });
    if (!agent) throw new UnauthorizedException();
    return this.prisma.printerAgent.update({
      where: { id: agent.id },
      data: { isOnline: true, lastHeartbeat: new Date() },
    });
  }

  async enqueueForTicket(ticketId: string) {
    const ticket = await this.prisma.kitchenTicket.findUnique({
      where: { id: ticketId },
      include: {
        items: true,
        station: true,
        order: { include: { items: true } },
      },
    });
    if (!ticket) return [];

    const mappings = await this.prisma.printerStationMapping.findMany({
      where: { stationId: ticket.stationId },
      include: { printer: true },
    });

    const jobs: any[] = [];
    for (const m of mappings) {
      if (!m.printer.isActive) continue;
      const key = `print:${ticketId}:${m.printerId}`;
      const existing = await this.prisma.printJob.findUnique({ where: { idempotencyKey: key } });
      if (existing) {
        jobs.push(existing);
        continue;
      }
      const job = await this.prisma.printJob.create({
        data: {
          printerId: m.printerId,
          ticketId,
          branchId: ticket.branchId,
          idempotencyKey: key,
          copies: m.copies,
          status: 'QUEUED',
          payload: {
            orderNumber: ticket.order.orderNumber,
            station: ticket.station.name,
            items: ticket.items.map((i) => ({
              name: i.nameSnapshot,
              qty: i.quantity,
              notes: i.notes,
            })),
            notes: ticket.order.notes,
          },
        },
      });
      jobs.push(job);
      await this.outbox.publish('PRINT_JOB_CREATED', 'print_job', job.id, {
        jobId: job.id,
        branchId: ticket.branchId,
      });
    }
    return jobs;
  }

  async nextJob(deviceToken: string) {
    const agent = await this.prisma.printerAgent.findUnique({ where: { deviceToken } });
    if (!agent) throw new UnauthorizedException();

    const job = await this.prisma.printJob.findFirst({
      where: { branchId: agent.branchId, status: { in: ['QUEUED', 'RETRYING'] } },
      orderBy: { createdAt: 'asc' },
      include: { printer: true },
    });
    if (!job) return null;

    return this.prisma.printJob.update({
      where: { id: job.id },
      data: { status: 'CLAIMED', claimedAt: new Date() },
      include: { printer: true },
    });
  }

  async ack(jobId: string, deviceToken: string) {
    await this.ensureAgent(deviceToken);
    return this.prisma.printJob.update({
      where: { id: jobId },
      data: { status: 'PRINTED', printedAt: new Date() },
    });
  }

  async fail(jobId: string, deviceToken: string, error?: string) {
    await this.ensureAgent(deviceToken);
    await this.prisma.printAttempt.create({
      data: { printJobId: jobId, status: 'FAILED', error },
    });
    return this.prisma.printJob.update({
      where: { id: jobId },
      data: { status: 'FAILED' },
    });
  }

  async retry(jobId: string) {
    return this.prisma.printJob.update({
      where: { id: jobId },
      data: { status: 'RETRYING' },
    });
  }

  listDevices(branchId: string) {
    return this.prisma.printerDevice.findMany({
      where: { branchId },
      include: { mappings: true },
    });
  }

  listAgents(branchId: string) {
    return this.prisma.printerAgent.findMany({ where: { branchId } });
  }

  private async ensureAgent(deviceToken: string) {
    const agent = await this.prisma.printerAgent.findUnique({ where: { deviceToken } });
    if (!agent) throw new UnauthorizedException();
    return agent;
  }
}
