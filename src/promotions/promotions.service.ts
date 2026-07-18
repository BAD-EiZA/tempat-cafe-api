import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePromotionDto) {
    if (dto.type === 'PERCENT' && dto.rules?.percentBps == null) {
      throw new BadRequestException('percentBps is required for percentage promotions');
    }
    if (dto.type === 'FIXED' && dto.rules?.value == null) {
      throw new BadRequestException('value is required for fixed promotions');
    }
    return this.prisma.promotion.create({
      data: {
        organizationId: dto.organizationId,
        branchId: dto.branchId,
        name: dto.name,
        type: dto.type || 'PERCENT',
        priority: dto.priority || 0,
        stackable: dto.stackable ?? false,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        rules: { ...dto.rules },
        schedules: dto.schedules
          ? {
              create: dto.schedules.map((s) => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
              })),
            }
          : undefined,
      },
      include: { schedules: true },
    });
  }

  list(organizationId: string) {
    return this.prisma.promotion.findMany({
      where: { organizationId },
      include: { schedules: true },
    });
  }

  async bestDiscount(ctx: {
    organizationId: string;
    branchId: string;
    subtotal: number;
    now?: Date;
  }) {
    const now = ctx.now || new Date();
    const promos = await this.prisma.promotion.findMany({
      where: {
        organizationId: ctx.organizationId,
        isActive: true,
        OR: [{ branchId: null }, { branchId: ctx.branchId }],
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      include: { schedules: true },
      orderBy: { priority: 'desc' },
    });

    const day = now.getDay();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let best = 0;
    let appliedId: string | undefined;
    for (const p of promos) {
      if (p.schedules.length) {
        const ok = p.schedules.some((s) => {
          if (s.dayOfWeek != null && s.dayOfWeek !== day) return false;
          if (s.startTime && hhmm < s.startTime) return false;
          if (s.endTime && hhmm > s.endTime) return false;
          return true;
        });
        if (!ok) continue;
      }
      const rules = (p.rules || {}) as any;
      let discount = 0;
       if (p.type === 'PERCENT') {
         const bps = rules.percentBps || 0;
         discount = Math.floor((ctx.subtotal * bps) / 10_000);
      } else if (rules.value) {
        discount = rules.value;
      }
       if (rules.maxDiscount != null) discount = Math.min(discount, rules.maxDiscount);
       discount = Math.min(discount, ctx.subtotal);
      if (discount > best) {
        best = discount;
        appliedId = p.id;
      }
      if (!p.stackable) break;
    }
    return { discount: best, promotionId: appliedId };
  }
}
