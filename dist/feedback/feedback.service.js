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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const outbox_service_1 = require("../outbox/outbox.service");
let FeedbackService = class FeedbackService {
    constructor(prisma, outbox) {
        this.prisma = prisma;
        this.outbox = outbox;
    }
    async create(dto) {
        const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        if (order.status !== 'COMPLETED' && order.status !== 'SERVED') {
            throw new common_1.BadRequestException('Order not completed');
        }
        if (dto.overallRating < 1 || dto.overallRating > 5) {
            throw new common_1.BadRequestException('Rating 1-5');
        }
        const fb = await this.prisma.feedback.upsert({
            where: { orderId: dto.orderId },
            create: {
                orderId: dto.orderId,
                customerId: dto.customerId || order.customerId,
                overallRating: dto.overallRating,
                foodRating: dto.foodRating,
                drinkRating: dto.drinkRating,
                serviceRating: dto.serviceRating,
                cleanlinessRating: dto.cleanlinessRating,
                speedRating: dto.speedRating,
                comment: dto.comment,
                tags: dto.tags || [],
                isPublic: dto.isPublic ?? false,
                contactConsent: dto.contactConsent ?? false,
            },
            update: {
                overallRating: dto.overallRating,
                foodRating: dto.foodRating,
                drinkRating: dto.drinkRating,
                serviceRating: dto.serviceRating,
                cleanlinessRating: dto.cleanlinessRating,
                speedRating: dto.speedRating,
                comment: dto.comment,
                tags: dto.tags || [],
                isPublic: dto.isPublic,
            },
        });
        await this.outbox.publish('FEEDBACK_CREATED', 'feedback', fb.id, {
            feedbackId: fb.id,
            orderId: dto.orderId,
            rating: dto.overallRating,
        });
        return fb;
    }
    async createFromToken(publicToken, dto) {
        const order = await this.prisma.order.findUnique({ where: { publicToken } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        return this.create({ ...dto, orderId: order.id });
    }
    list(organizationId, branchId) {
        return this.prisma.feedback.findMany({
            where: {
                order: {
                    organizationId,
                    branchId,
                },
            },
            include: { responses: true, order: true },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    respond(feedbackId, message, actorId) {
        return this.prisma.feedbackResponse.create({
            data: { feedbackId, message, actorId },
        });
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        outbox_service_1.OutboxService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map