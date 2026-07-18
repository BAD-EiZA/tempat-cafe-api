import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OutboxService } from '../outbox/outbox.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async create(dto: {
    orderId: string;
    overallRating: number;
    foodRating?: number;
    drinkRating?: number;
    serviceRating?: number;
    cleanlinessRating?: number;
    speedRating?: number;
    comment?: string;
    tags?: string[];
    isPublic?: boolean;
    contactConsent?: boolean;
    customerId?: string;
  }) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new BadRequestException('Order not found');
    if (order.status !== 'COMPLETED' && order.status !== 'SERVED') {
      throw new BadRequestException('Order not completed');
    }
    if (dto.overallRating < 1 || dto.overallRating > 5) {
      throw new BadRequestException('Rating 1-5');
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

  async createFromToken(
    publicToken: string,
    dto: Omit<Parameters<FeedbackService['create']>[0], 'orderId'> & { orderId?: string },
  ) {
    const order = await this.prisma.order.findUnique({ where: { publicToken } });
    if (!order) throw new BadRequestException('Order not found');
    return this.create({ ...dto, orderId: order.id });
  }

  list(organizationId?: string, branchId?: string) {
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

  respond(feedbackId: string, message: string, actorId: string) {
    return this.prisma.feedbackResponse.create({
      data: { feedbackId, message, actorId },
    });
  }
}
