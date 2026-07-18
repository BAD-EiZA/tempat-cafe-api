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
exports.VouchersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VouchersService = class VouchersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto) {
        return this.prisma.voucher.create({
            data: {
                organizationId: dto.organizationId,
                branchId: dto.branchId,
                name: dto.name,
                type: dto.type,
                value: dto.value,
                percentBps: dto.percentBps,
                minSpend: dto.minSpend || 0,
                maxDiscount: dto.maxDiscount,
                startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
                endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
                totalLimit: dto.totalLimit,
                perCustomerLimit: dto.perCustomerLimit,
                stackable: dto.stackable ?? false,
                codes: dto.code
                    ? { create: { code: String(dto.code).toUpperCase() } }
                    : undefined,
            },
            include: { codes: true },
        });
    }
    list(organizationId) {
        return this.prisma.voucher.findMany({
            where: { organizationId },
            include: { codes: true },
        });
    }
    async validateAndQuote(code, ctx) {
        const vc = await this.prisma.voucherCode.findUnique({
            where: { code: code.toUpperCase() },
            include: { voucher: true },
        });
        if (!vc?.isActive || !vc.voucher.isActive) {
            throw new common_1.BadRequestException('Voucher invalid');
        }
        const v = vc.voucher;
        if (v.organizationId !== ctx.organizationId) {
            throw new common_1.BadRequestException('Voucher invalid');
        }
        if (v.branchId && v.branchId !== ctx.branchId) {
            throw new common_1.BadRequestException('Voucher not valid for branch');
        }
        const now = new Date();
        if (v.startsAt && v.startsAt > now)
            throw new common_1.BadRequestException('Voucher not started');
        if (v.endsAt && v.endsAt < now)
            throw new common_1.BadRequestException('Voucher expired');
        if (ctx.subtotal < v.minSpend)
            throw new common_1.BadRequestException('Min spend not met');
        if (v.totalLimit != null) {
            const used = await this.prisma.voucherRedemption.count({ where: { voucherId: v.id } });
            if (used >= v.totalLimit)
                throw new common_1.BadRequestException('Voucher limit reached');
        }
        if (v.perCustomerLimit != null && ctx.customerId) {
            const used = await this.prisma.voucherRedemption.count({
                where: { voucherId: v.id, customerId: ctx.customerId },
            });
            if (used >= v.perCustomerLimit)
                throw new common_1.BadRequestException('Customer limit reached');
        }
        let discount = 0;
        if (v.type === 'PERCENT' && v.percentBps) {
            discount = Math.floor((ctx.subtotal * v.percentBps) / 10_000);
        }
        else if (v.type === 'NOMINAL' && v.value) {
            discount = v.value;
        }
        else if (v.value) {
            discount = v.value;
        }
        if (v.maxDiscount != null)
            discount = Math.min(discount, v.maxDiscount);
        discount = Math.min(discount, ctx.subtotal);
        return { voucherId: v.id, discount, code: vc.code };
    }
    async reserve(voucherId, orderId, customerId, tx) {
        const client = tx || this.prisma;
        return client.voucherReservation.create({
            data: {
                voucherId,
                orderId,
                customerId,
                expiresAt: new Date(Date.now() + 30 * 60_000),
                status: 'RESERVED',
            },
        });
    }
    async consume(voucherId, orderId, amount, tx) {
        const client = tx || this.prisma;
        await client.voucherReservation.updateMany({
            where: { voucherId, orderId, status: 'RESERVED' },
            data: { status: 'CONSUMED' },
        });
        return client.voucherRedemption.create({
            data: { voucherId, orderId, amount },
        });
    }
    release(orderId, tx) {
        const client = tx || this.prisma;
        return client.voucherReservation.updateMany({
            where: { orderId, status: 'RESERVED' },
            data: { status: 'RELEASED' },
        });
    }
};
exports.VouchersService = VouchersService;
exports.VouchersService = VouchersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VouchersService);
//# sourceMappingURL=vouchers.service.js.map