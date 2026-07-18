import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type Tx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: any) {
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

  list(organizationId: string) {
    return this.prisma.voucher.findMany({
      where: { organizationId },
      include: { codes: true },
    });
  }

  async validateAndQuote(
    code: string,
    ctx: {
      organizationId: string;
      branchId: string;
      subtotal: number;
      customerId?: string;
    },
  ) {
    const vc = await this.prisma.voucherCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { voucher: true },
    });
    if (!vc?.isActive || !vc.voucher.isActive) {
      throw new BadRequestException('Voucher invalid');
    }
    const v = vc.voucher;
    if (v.organizationId !== ctx.organizationId) {
      throw new BadRequestException('Voucher invalid');
    }
    if (v.branchId && v.branchId !== ctx.branchId) {
      throw new BadRequestException('Voucher not valid for branch');
    }
    const now = new Date();
    if (v.startsAt && v.startsAt > now) throw new BadRequestException('Voucher not started');
    if (v.endsAt && v.endsAt < now) throw new BadRequestException('Voucher expired');
    if (ctx.subtotal < v.minSpend) throw new BadRequestException('Min spend not met');

    if (v.totalLimit != null) {
      const used = await this.prisma.voucherRedemption.count({ where: { voucherId: v.id } });
      if (used >= v.totalLimit) throw new BadRequestException('Voucher limit reached');
    }
    if (v.perCustomerLimit != null && ctx.customerId) {
      const used = await this.prisma.voucherRedemption.count({
        where: { voucherId: v.id, customerId: ctx.customerId },
      });
      if (used >= v.perCustomerLimit) throw new BadRequestException('Customer limit reached');
    }

    let discount = 0;
    if (v.type === 'PERCENT' && v.percentBps) {
      discount = Math.floor((ctx.subtotal * v.percentBps) / 10_000);
    } else if (v.type === 'NOMINAL' && v.value) {
      discount = v.value;
    } else if (v.value) {
      discount = v.value;
    }
    if (v.maxDiscount != null) discount = Math.min(discount, v.maxDiscount);
    discount = Math.min(discount, ctx.subtotal);

    return { voucherId: v.id, discount, code: vc.code };
  }

  async reserve(voucherId: string, orderId: string, customerId?: string, tx?: Tx) {
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

  async consume(voucherId: string, orderId: string, amount: number, tx?: Tx) {
    const client = tx || this.prisma;
    await client.voucherReservation.updateMany({
      where: { voucherId, orderId, status: 'RESERVED' },
      data: { status: 'CONSUMED' },
    });
    return client.voucherRedemption.create({
      data: { voucherId, orderId, amount },
    });
  }

  release(orderId: string, tx?: Tx) {
    const client = tx || this.prisma;
    return client.voucherReservation.updateMany({
      where: { orderId, status: 'RESERVED' },
      data: { status: 'RELEASED' },
    });
  }
}
