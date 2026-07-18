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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertFromUser(userId, data) {
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
    async ensureMembership(customerId, organizationId) {
        const existing = await this.prisma.customerMembership.findUnique({
            where: { customerId_organizationId: { customerId, organizationId } },
        });
        if (existing)
            return existing;
        const tier = await this.prisma.membershipTier.findFirst({
            where: { organizationId },
            orderBy: { sortOrder: 'asc' },
        });
        if (!tier)
            return null;
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
    list(organizationId) {
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
    get(id, organizationId) {
        return this.prisma.customer.findFirst({
            where: { id, profiles: { some: { organizationId } } },
            include: {
                memberships: { where: { organizationId }, include: { tier: true } },
                loyaltyAccounts: { where: { organizationId } },
                orders: { where: { organizationId }, take: 20, orderBy: { createdAt: 'desc' } },
            },
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map