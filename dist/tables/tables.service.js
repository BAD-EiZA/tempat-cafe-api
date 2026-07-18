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
exports.TablesService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let TablesService = class TablesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    createArea(branchId, name, type = 'CUSTOM') {
        return this.prisma.area.create({ data: { branchId, name, type } });
    }
    listAreas(branchId) {
        return this.prisma.area.findMany({
            where: { branchId },
            include: { tables: { include: { qrTokens: { where: { isActive: true } } } } },
        });
    }
    async createTable(dto) {
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
        const token = (0, crypto_1.randomBytes)(16).toString('hex');
        await this.prisma.tableQrToken.create({
            data: { tableId: table.id, token },
        });
        return this.prisma.cafeTable.findUnique({
            where: { id: table.id },
            include: { qrTokens: { where: { isActive: true } } },
        });
    }
    listTables(branchId) {
        return this.prisma.cafeTable.findMany({
            where: { branchId },
            include: { area: true, qrTokens: { where: { isActive: true } } },
            orderBy: { name: 'asc' },
        });
    }
    floorMap(branchId) {
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
    async updatePosition(tableId, posX, posY) {
        return this.prisma.cafeTable.update({
            where: { id: tableId },
            data: { posX, posY },
        });
    }
    async rotateQr(tableId) {
        await this.prisma.tableQrToken.updateMany({
            where: { tableId, isActive: true },
            data: { isActive: false, revokedAt: new Date() },
        });
        const token = (0, crypto_1.randomBytes)(16).toString('hex');
        return this.prisma.tableQrToken.create({ data: { tableId, token } });
    }
    async resolveQr(token) {
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
        if (!qr)
            throw new common_1.NotFoundException('Invalid QR');
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
    updateStatus(tableId, status) {
        return this.prisma.cafeTable.update({ where: { id: tableId }, data: { status } });
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TablesService);
//# sourceMappingURL=tables.service.js.map