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
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PromotionsService = class PromotionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto) {
        if (dto.type === 'PERCENT' && dto.rules?.percentBps == null) {
            throw new common_1.BadRequestException('percentBps is required for percentage promotions');
        }
        if (dto.type === 'FIXED' && dto.rules?.value == null) {
            throw new common_1.BadRequestException('value is required for fixed promotions');
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
    list(organizationId) {
        return this.prisma.promotion.findMany({
            where: { organizationId },
            include: { schedules: true },
        });
    }
    async bestDiscount(ctx) {
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
        let appliedId;
        for (const p of promos) {
            if (p.schedules.length) {
                const ok = p.schedules.some((s) => {
                    if (s.dayOfWeek != null && s.dayOfWeek !== day)
                        return false;
                    if (s.startTime && hhmm < s.startTime)
                        return false;
                    if (s.endTime && hhmm > s.endTime)
                        return false;
                    return true;
                });
                if (!ok)
                    continue;
            }
            const rules = (p.rules || {});
            let discount = 0;
            if (p.type === 'PERCENT') {
                const bps = rules.percentBps || 0;
                discount = Math.floor((ctx.subtotal * bps) / 10_000);
            }
            else if (rules.value) {
                discount = rules.value;
            }
            if (rules.maxDiscount != null)
                discount = Math.min(discount, rules.maxDiscount);
            discount = Math.min(discount, ctx.subtotal);
            if (discount > best) {
                best = discount;
                appliedId = p.id;
            }
            if (!p.stackable)
                break;
        }
        return { discount: best, promotionId: appliedId };
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map