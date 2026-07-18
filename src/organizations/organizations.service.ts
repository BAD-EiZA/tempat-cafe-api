import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listForUser(userId: string) {
    return this.prisma.organizationMember.findMany({
      where: { userId },
      include: { organization: true, role: true },
    });
  }

  async create(userId: string, dto: {
    name: string;
    legalName?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    brandName?: string;
    branchName?: string;
  }) {
    const base = slugify(dto.name) || 'merchant';
    let slug = base;
    let i = 0;
    while (await this.prisma.organization.findUnique({ where: { slug } })) {
      i += 1;
      slug = `${base}-${i}`;
    }

    const ownerRole = await this.prisma.role.findUnique({ where: { code: 'OWNER' } });
    if (!ownerRole) throw new BadRequestException('OWNER role missing — run seed');

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

  async get(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { brands: true, branches: true, payoutAccounts: true },
    });
    if (!org) throw new NotFoundException();
    return org;
  }

  async update(id: string, userId: string, dto: Record<string, unknown>) {
    const before = await this.get(id);
    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        name: dto.name as string | undefined,
        legalName: dto.legalName as string | undefined,
        businessType: dto.businessType as string | undefined,
        picName: dto.picName as string | undefined,
        email: dto.email as string | undefined,
        phone: dto.phone as string | undefined,
        address: dto.address as string | undefined,
        taxId: dto.taxId as string | undefined,
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

  async submitOnboarding(id: string, userId: string) {
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

  async setPayoutAccount(
    organizationId: string,
    userId: string,
    dto: { bankName: string; accountName: string; accountNumber: string },
  ) {
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

  listMembers(organizationId: string) {
    return this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: true, role: true },
    });
  }

  async inviteMember(
    organizationId: string,
    actorId: string,
    dto: { email: string; name?: string; roleCode?: string },
  ) {
    const role = await this.prisma.role.findUnique({
      where: { code: dto.roleCode || 'CASHIER' },
    });
    if (!role) throw new BadRequestException('Role not found');

    let user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          kindeId: `invite-${dto.email.toLowerCase()}`,
          email: dto.email,
          name: dto.name || dto.email.split('@')[0],
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

  async removeMember(organizationId: string, userId: string, actorId: string) {
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
}
