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
exports.PrintersService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const outbox_service_1 = require("../outbox/outbox.service");
let PrintersService = class PrintersService {
    constructor(prisma, outbox) {
        this.prisma = prisma;
        this.outbox = outbox;
    }
    createDevice(dto) {
        return this.prisma.printerDevice.create({ data: dto });
    }
    mapStation(printerId, stationId, isPrimary = true, copies = 1) {
        return this.prisma.printerStationMapping.create({
            data: { printerId, stationId, isPrimary, copies },
        });
    }
    async registerAgent(branchId, name) {
        const deviceToken = (0, crypto_1.randomBytes)(24).toString('hex');
        return this.prisma.printerAgent.create({
            data: { branchId, name, deviceToken, isOnline: true, lastHeartbeat: new Date() },
        });
    }
    async heartbeat(deviceToken) {
        const agent = await this.prisma.printerAgent.findUnique({ where: { deviceToken } });
        if (!agent)
            throw new common_1.UnauthorizedException();
        return this.prisma.printerAgent.update({
            where: { id: agent.id },
            data: { isOnline: true, lastHeartbeat: new Date() },
        });
    }
    async enqueueForTicket(ticketId) {
        const ticket = await this.prisma.kitchenTicket.findUnique({
            where: { id: ticketId },
            include: {
                items: true,
                station: true,
                order: { include: { items: true } },
            },
        });
        if (!ticket)
            return [];
        const mappings = await this.prisma.printerStationMapping.findMany({
            where: { stationId: ticket.stationId },
            include: { printer: true },
        });
        const jobs = [];
        for (const m of mappings) {
            if (!m.printer.isActive)
                continue;
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
    async nextJob(deviceToken) {
        const agent = await this.prisma.printerAgent.findUnique({ where: { deviceToken } });
        if (!agent)
            throw new common_1.UnauthorizedException();
        const job = await this.prisma.printJob.findFirst({
            where: { branchId: agent.branchId, status: { in: ['QUEUED', 'RETRYING'] } },
            orderBy: { createdAt: 'asc' },
            include: { printer: true },
        });
        if (!job)
            return null;
        return this.prisma.printJob.update({
            where: { id: job.id },
            data: { status: 'CLAIMED', claimedAt: new Date() },
            include: { printer: true },
        });
    }
    async ack(jobId, deviceToken) {
        await this.ensureAgent(deviceToken);
        return this.prisma.printJob.update({
            where: { id: jobId },
            data: { status: 'PRINTED', printedAt: new Date() },
        });
    }
    async fail(jobId, deviceToken, error) {
        await this.ensureAgent(deviceToken);
        await this.prisma.printAttempt.create({
            data: { printJobId: jobId, status: 'FAILED', error },
        });
        return this.prisma.printJob.update({
            where: { id: jobId },
            data: { status: 'FAILED' },
        });
    }
    async retry(jobId) {
        return this.prisma.printJob.update({
            where: { id: jobId },
            data: { status: 'RETRYING' },
        });
    }
    listDevices(branchId) {
        return this.prisma.printerDevice.findMany({
            where: { branchId },
            include: { mappings: true },
        });
    }
    listAgents(branchId) {
        return this.prisma.printerAgent.findMany({ where: { branchId } });
    }
    async ensureAgent(deviceToken) {
        const agent = await this.prisma.printerAgent.findUnique({ where: { deviceToken } });
        if (!agent)
            throw new common_1.UnauthorizedException();
        return agent;
    }
};
exports.PrintersService = PrintersService;
exports.PrintersService = PrintersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        outbox_service_1.OutboxService])
], PrintersService);
//# sourceMappingURL=printers.service.js.map