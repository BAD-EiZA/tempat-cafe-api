import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  createArea(branchId: string, name: string, type = 'CUSTOM') {
    return this.prisma.area.create({ data: { branchId, name, type } });
  }

  listAreas(branchId: string) {
    return this.prisma.area.findMany({
      where: { branchId },
      include: { tables: { include: { qrTokens: { where: { isActive: true } } } } },
    });
  }

  async createTable(dto: {
    branchId: string;
    areaId?: string;
    name: string;
    capacity?: number;
    posX?: number;
    posY?: number;
  }) {
    const table = await this.prisma.cafeTable.create({
      data: {
        branchId: dto.branchId,
        areaId: dto.areaId,
        name: dto.name,
        capacity: dto.capacity ?? 2,
        posX: dto.posX,
        posY: dto.posY,
      },
    });
    const token = randomBytes(16).toString('hex');
    await this.prisma.tableQrToken.create({
      data: { tableId: table.id, token },
    });
    return this.prisma.cafeTable.findUnique({
      where: { id: table.id },
      include: { qrTokens: { where: { isActive: true } } },
    });
  }

  listTables(branchId: string) {
    return this.prisma.cafeTable.findMany({
      where: { branchId },
      include: { area: true, qrTokens: { where: { isActive: true } } },
      orderBy: { name: 'asc' },
    });
  }

  floorMap(branchId: string) {
    return this.prisma.cafeTable.findMany({
      where: { branchId },
      include: {
        area: true,
        sessions: {
          where: { status: { in: ['OPEN', 'ACTIVE', 'CHECKOUT_IN_PROGRESS'] } },
          take: 1,
          orderBy: { startedAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async updatePosition(tableId: string, posX: number, posY: number) {
    return this.prisma.cafeTable.update({
      where: { id: tableId },
      data: { posX, posY },
    });
  }

  async rotateQr(tableId: string) {
    await this.prisma.tableQrToken.updateMany({
      where: { tableId, isActive: true },
      data: { isActive: false, revokedAt: new Date() },
    });
    const token = randomBytes(16).toString('hex');
    return this.prisma.tableQrToken.create({ data: { tableId, token } });
  }

  async resolveQr(token: string) {
    const qr = await this.prisma.tableQrToken.findFirst({
      where: { token, isActive: true },
      include: {
        table: {
          include: {
            branch: { include: { brand: true, organization: true } },
            area: true,
            sessions: {
              where: { status: { in: ['OPEN', 'ACTIVE', 'CHECKOUT_IN_PROGRESS'] } },
              orderBy: { startedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });
    if (!qr) throw new NotFoundException('Invalid QR');
    return {
      token: qr.token,
      table: {
        id: qr.table.id,
        name: qr.table.name,
        status: qr.table.status,
        capacity: qr.table.capacity,
        area: qr.table.area,
        posX: qr.table.posX,
        posY: qr.table.posY,
      },
      branch: {
        id: qr.table.branch.id,
        name: qr.table.branch.name,
        slug: qr.table.branch.slug,
        organizationId: qr.table.branch.organizationId,
        brand: qr.table.branch.brand,
      },
      activeSession: qr.table.sessions[0] || null,
    };
  }

  updateStatus(tableId: string, status: any) {
    return this.prisma.cafeTable.update({ where: { id: tableId }, data: { status } });
  }
}
