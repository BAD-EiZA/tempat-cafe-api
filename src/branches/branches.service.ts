import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId?: string) {
    return this.prisma.branch.findMany({
      where: organizationId ? { organizationId, deletedAt: null } : { deletedAt: null },
      include: { brand: true, hours: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async get(id: string) {
    const b = await this.prisma.branch.findUnique({
      where: { id },
      include: { brand: true, hours: true, stations: true },
    });
    if (!b) throw new NotFoundException();
    return b;
  }

  create(dto: {
    organizationId: string;
    brandId: string;
    name: string;
    slug: string;
    address?: string;
    phone?: string;
    taxBps?: number;
    serviceChargeBps?: number;
  }) {
    return this.prisma.branch.create({
      data: {
        organizationId: dto.organizationId,
        brandId: dto.brandId,
        name: dto.name,
        slug: dto.slug,
        address: dto.address,
        phone: dto.phone,
        taxBps: dto.taxBps ?? 0,
        serviceChargeBps: dto.serviceChargeBps ?? 0,
        status: 'DRAFT',
      },
    });
  }

  update(id: string, dto: Record<string, unknown>) {
    return this.prisma.branch.update({
      where: { id },
      data: {
        name: dto.name as string | undefined,
        address: dto.address as string | undefined,
        phone: dto.phone as string | undefined,
        whatsapp: dto.whatsapp as string | undefined,
        latitude: dto.latitude as number | undefined,
        longitude: dto.longitude as number | undefined,
        taxBps: dto.taxBps as number | undefined,
        serviceChargeBps: dto.serviceChargeBps as number | undefined,
        minOrderAmount: dto.minOrderAmount as number | undefined,
        paymentTimeoutSec: dto.paymentTimeoutSec as number | undefined,
        status: dto.status as any,
        settings: dto.settings as object | undefined,
      },
    });
  }

  setHours(branchId: string, hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed?: boolean }[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.branchHour.deleteMany({ where: { branchId } });
      await tx.branchHour.createMany({
        data: hours.map((h) => ({
          branchId,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed ?? false,
        })),
      });
      return tx.branchHour.findMany({ where: { branchId } });
    });
  }
}
