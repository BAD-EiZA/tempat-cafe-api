import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type Tx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class TipsService {
  constructor(private readonly prisma: PrismaService) {}

  async createForOrder(orderId: string, amount: number, tx?: Tx) {
    const client = tx || this.prisma;
    return client.tip.create({
      data: {
        orderId,
        amount,
        allocationMode: 'BRANCH_POOL',
        status: 'COLLECTED',
        allocations: {
          create: {
            poolCode: 'BRANCH',
            amount,
            status: 'ALLOCATED',
          },
        },
      },
    });
  }

  listByBranch(branchId: string) {
    return this.prisma.tip.findMany({
      where: { order: { branchId } },
      include: { allocations: true, order: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async allocateToStaff(
    tipId: string,
    splits: { userId: string; amount: number }[],
  ) {
    const tip = await this.prisma.tip.findUnique({
      where: { id: tipId },
      include: { allocations: true },
    });
    if (!tip) throw new BadRequestException('Tip not found');
    const total = splits.reduce((s, x) => s + x.amount, 0);
    if (total !== tip.amount) throw new BadRequestException('Split must equal tip amount');

    await this.prisma.tipAllocation.deleteMany({ where: { tipId } });
    await this.prisma.tipAllocation.createMany({
      data: splits.map((s) => ({
        tipId,
        userId: s.userId,
        amount: s.amount,
        status: 'ALLOCATED',
      })),
    });
    return this.prisma.tip.update({
      where: { id: tipId },
      data: { allocationMode: 'STAFF_SPLIT', status: 'ALLOCATED' },
      include: { allocations: true },
    });
  }
}
