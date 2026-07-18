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
exports.TipsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TipsService = class TipsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createForOrder(orderId, amount, tx) {
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
    listByBranch(branchId) {
        return this.prisma.tip.findMany({
            where: { order: { branchId } },
            include: { allocations: true, order: true },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async allocateToStaff(tipId, splits) {
        const tip = await this.prisma.tip.findUnique({
            where: { id: tipId },
            include: { allocations: true },
        });
        if (!tip)
            throw new common_1.BadRequestException('Tip not found');
        const total = splits.reduce((s, x) => s + x.amount, 0);
        if (total !== tip.amount)
            throw new common_1.BadRequestException('Split must equal tip amount');
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
};
exports.TipsService = TipsService;
exports.TipsService = TipsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TipsService);
//# sourceMappingURL=tips.service.js.map