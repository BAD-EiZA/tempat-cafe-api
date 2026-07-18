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
exports.OutboxService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OutboxService = class OutboxService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async publish(eventType, aggregateType, aggregateId, payload, tx) {
        const client = tx || this.prisma;
        return client.outboxEvent.create({
            data: {
                eventType,
                aggregateType,
                aggregateId,
                payload: payload,
                status: 'PENDING',
            },
        });
    }
    async claimPending(limit = 50) {
        const events = await this.prisma.outboxEvent.findMany({
            where: { status: 'PENDING', availableAt: { lte: new Date() } },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
        const claimed = [];
        for (const e of events) {
            try {
                const updated = await this.prisma.outboxEvent.updateMany({
                    where: { id: e.id, status: 'PENDING' },
                    data: { status: 'PROCESSING', attempts: { increment: 1 } },
                });
                if (updated.count === 1)
                    claimed.push(e);
            }
            catch {
            }
        }
        return claimed;
    }
    async markProcessed(id) {
        return this.prisma.outboxEvent.update({
            where: { id },
            data: { status: 'PROCESSED', processedAt: new Date() },
        });
    }
    async markFailed(id, attempts) {
        return this.prisma.outboxEvent.update({
            where: { id },
            data: {
                status: attempts >= 10 ? 'DEAD' : 'PENDING',
                attempts,
                availableAt: new Date(Date.now() + Math.min(attempts, 10) * 30_000),
            },
        });
    }
};
exports.OutboxService = OutboxService;
exports.OutboxService = OutboxService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OutboxService);
//# sourceMappingURL=outbox.service.js.map