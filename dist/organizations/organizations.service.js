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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
function slugify(s) {
    return s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 48);
}
let OrganizationsService = class OrganizationsService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async listForUser(userId) {
        return this.prisma.organizationMember.findMany({
            where: { userId },
            include: { organization: true, role: true },
        });
    }
    async create(userId, dto) {
        const base = slugify(dto.name) || 'merchant';
        let slug = base;
        let i = 0;
        while (await this.prisma.organization.findUnique({ where: { slug } })) {
            i += 1;
            slug = `${base}-${i}`;
        }
        const ownerRole = await this.prisma.role.findUnique({ where: { code: 'OWNER' } });
        if (!ownerRole)
            throw new common_1.BadRequestException('OWNER role missing — run seed');
        const org = await this.prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {
                    name: dto.name,
                    slug,
                    legalName: dto.legalName,
                    email: dto.email,
                    phone: dto.phone,
                    address: dto.address,
                    taxId: dto.taxId,
                    status: 'DRAFT',
                },
            });
            await tx.organizationMember.create({
                data: {
                    organizationId: organization.id,
                    userId,
                    roleId: ownerRole.id,
                },
            });
            await tx.merchantBalance.create({
                data: { organizationId: organization.id },
            });
            for (const code of ['AVAILABLE', 'PENDING', 'TIP_PAYABLE']) {
                await tx.merchantLedgerAccount.create({
                    data: {
                        organizationId: organization.id,
                        code,
                        name: code,
                    },
                });
            }
            const brand = await tx.brand.create({
                data: {
                    organizationId: organization.id,
                    name: dto.brandName || dto.name,
                    slug: slugify(dto.brandName || dto.name) || 'brand',
                },
            });
            const branch = await tx.branch.create({
                data: {
                    organizationId: organization.id,
                    brandId: brand.id,
                    name: dto.branchName || 'Cabang Utama',
                    slug: 'main',
                    status: 'DRAFT',
                },
            });
            await tx.kitchenStation.createMany({
                data: [
                    { branchId: branch.id, name: 'Kitchen', code: 'KITCHEN', sortOrder: 1 },
                    { branchId: branch.id, name: 'Barista', code: 'BARISTA', sortOrder: 2 },
                ],
            });
            await tx.loyaltyRule.create({
                data: { organizationId: organization.id },
            });
            await tx.membershipTier.createMany({
                data: [
                    { organizationId: organization.id, code: 'MEMBER', name: 'Member', minPoints: 0, sortOrder: 0 },
                    { organizationId: organization.id, code: 'SILVER', name: 'Silver', minPoints: 500, sortOrder: 1 },
                    { organizationId: organization.id, code: 'GOLD', name: 'Gold', minPoints: 2000, sortOrder: 2 },
                    { organizationId: organization.id, code: 'PLATINUM', name: 'Platinum', minPoints: 5000, sortOrder: 3 },
                ],
            });
            return { organization, brand, branch };
        });
        await this.audit.log({
            organizationId: org.organization.id,
            actorId: userId,
            action: 'ORGANIZATION_CREATED',
            entityType: 'organization',
            entityId: org.organization.id,
            after: org.organization,
        });
        return org;
    }
    async get(id) {
        const org = await this.prisma.organization.findUnique({
            where: { id },
            include: { brands: true, branches: true, payoutAccounts: true },
        });
        if (!org)
            throw new common_1.NotFoundException();
        return org;
    }
    async update(id, userId, dto) {
        const before = await this.get(id);
        const organization = await this.prisma.organization.update({
            where: { id },
            data: {
                name: dto.name,
                legalName: dto.legalName,
                businessType: dto.businessType,
                picName: dto.picName,
                email: dto.email,
                phone: dto.phone,
                address: dto.address,
                taxId: dto.taxId,
            },
        });
        await this.audit.log({
            organizationId: id,
            actorId: userId,
            action: 'ORGANIZATION_UPDATED',
            entityType: 'organization',
            entityId: id,
            before,
            after: organization,
        });
        return organization;
    }
    async submitOnboarding(id, userId) {
        const org = await this.prisma.organization.update({
            where: { id },
            data: { status: 'SUBMITTED' },
        });
        await this.audit.log({
            organizationId: id,
            actorId: userId,
            action: 'ONBOARDING_SUBMITTED',
            entityType: 'organization',
            entityId: id,
        });
        return org;
    }
    async setPayoutAccount(organizationId, userId, dto) {
        const account = await this.prisma.payoutAccount.create({
            data: { organizationId, ...dto, isVerified: false },
        });
        await this.audit.log({
            organizationId,
            actorId: userId,
            action: 'PAYOUT_ACCOUNT_ADDED',
            entityType: 'payout_account',
            entityId: account.id,
            after: account,
        });
        return account;
    }
    listMembers(organizationId) {
        return this.prisma.organizationMember.findMany({
            where: { organizationId },
            include: { user: true, role: true },
        });
    }
    async inviteMember(organizationId, actorId, dto) {
        const email = dto.email.trim().toLowerCase();
        if (!email)
            throw new common_1.BadRequestException('Email is required');
        const role = await this.prisma.role.findUnique({
            where: { code: dto.roleCode || 'CASHIER' },
        });
        if (!role)
            throw new common_1.BadRequestException('Role not found');
        let user = await this.prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    kindeId: `invite-${email}`,
                    email,
                    name: dto.name || email.split('@')[0],
                },
            });
        }
        const member = await this.prisma.organizationMember.upsert({
            where: {
                organizationId_userId: { organizationId, userId: user.id },
            },
            create: { organizationId, userId: user.id, roleId: role.id },
            update: { roleId: role.id },
            include: { user: true, role: true },
        });
        await this.audit.log({
            organizationId,
            actorId,
            action: 'STAFF_INVITED',
            entityType: 'organization_member',
            entityId: member.id,
            after: member,
        });
        return member;
    }
    async removeMember(organizationId, userId, actorId) {
        await this.prisma.organizationMember.deleteMany({
            where: { organizationId, userId },
        });
        await this.audit.log({
            organizationId,
            actorId,
            action: 'STAFF_REMOVED',
            entityType: 'user',
            entityId: userId,
        });
        return { ok: true };
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map