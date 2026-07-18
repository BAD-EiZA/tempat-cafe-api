import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertFromUser(userId: string, data?: { name?: string; email?: string; phone?: string }) {
    const existing = await this.prisma.customer.findUnique({ where: { userId } });
    if (existing) {
      return this.prisma.customer.update({
        where: { id: existing.id },
        data: {
          name: data?.name || existing.name,
          email: data?.email || existing.email,
          phone: data?.phone || existing.phone,
        },
      });
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return this.prisma.customer.create({
      data: {
        userId,
        name: data?.name || user?.name,
        email: data?.email || user?.email,
        phone: data?.phone || user?.phone,
      },
    });
  }

  async ensureMembership(customerId: string, organizationId: string) {
    const existing = await this.prisma.customerMembership.findUnique({
      where: { customerId_organizationId: { customerId, organizationId } },
    });
    if (existing) return existing;
    const tier = await this.prisma.membershipTier.findFirst({
      where: { organizationId },
      orderBy: { sortOrder: 'asc' },
    });
    if (!tier) return null;
    await this.prisma.customerMerchantProfile.upsert({
      where: { customerId_organizationId: { customerId, organizationId } },
      create: { customerId, organizationId },
      update: {},
    });
    await this.prisma.loyaltyAccount.upsert({
      where: { customerId_organizationId: { customerId, organizationId } },
      create: { customerId, organizationId },
      update: {},
    });
    return this.prisma.customerMembership.create({
      data: { customerId, organizationId, tierId: tier.id },
    });
  }

  list(organizationId: string) {
    return this.prisma.customerMerchantProfile.findMany({
      where: { organizationId },
      include: {
        customer: {
          include: {
            memberships: { where: { organizationId }, include: { tier: true } },
            loyaltyAccounts: { where: { organizationId } },
          },
        },
      },
      take: 100,
    });
  }

  get(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        memberships: { include: { tier: true } },
        loyaltyAccounts: true,
        orders: { take: 20, orderBy: { createdAt: 'desc' } },
      },
    });
  }
}
