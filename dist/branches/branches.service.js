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
exports.BranchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BranchesService = class BranchesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(organizationId) {
        return this.prisma.branch.findMany({
            where: organizationId ? { organizationId, deletedAt: null } : { deletedAt: null },
            include: { brand: true, hours: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    async get(id) {
        const b = await this.prisma.branch.findUnique({
            where: { id },
            include: { brand: true, hours: true, stations: true },
        });
        if (!b)
            throw new common_1.NotFoundException();
        return b;
    }
    create(dto) {
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
    update(id, dto) {
        return this.prisma.branch.update({
            where: { id },
            data: {
                name: dto.name,
                address: dto.address,
                phone: dto.phone,
                whatsapp: dto.whatsapp,
                latitude: dto.latitude,
                longitude: dto.longitude,
                taxBps: dto.taxBps,
                serviceChargeBps: dto.serviceChargeBps,
                minOrderAmount: dto.minOrderAmount,
                paymentTimeoutSec: dto.paymentTimeoutSec,
                status: dto.status,
                settings: dto.settings,
            },
        });
    }
    setHours(branchId, hours) {
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
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BranchesService);
//# sourceMappingURL=branches.service.js.map