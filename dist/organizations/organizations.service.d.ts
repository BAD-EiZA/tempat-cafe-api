import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class OrganizationsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    listForUser(userId: string): Promise<({
        organization: {
            email: string | null;
            name: string;
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            legalName: string | null;
            businessType: string | null;
            picName: string | null;
            address: string | null;
            taxId: string | null;
            status: import(".prisma/client").$Enums.OnboardingStatus;
            platformFeeBps: number | null;
        };
        role: {
            name: string;
            id: string;
            createdAt: Date;
            code: string;
            isSystem: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        organizationId: string;
        userId: string;
        roleId: string;
    })[]>;
    create(userId: string, dto: {
        name: string;
        legalName?: string;
        email?: string;
        phone?: string;
        address?: string;
        taxId?: string;
        brandName?: string;
        branchName?: string;
    }): Promise<{
        organization: {
            email: string | null;
            name: string;
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            legalName: string | null;
            businessType: string | null;
            picName: string | null;
            address: string | null;
            taxId: string | null;
            status: import(".prisma/client").$Enums.OnboardingStatus;
            platformFeeBps: number | null;
        };
        brand: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            slug: string;
            deletedAt: Date | null;
            logoUrl: string | null;
            description: string | null;
        };
        branch: {
            name: string;
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            slug: string;
            address: string | null;
            status: import(".prisma/client").$Enums.BranchStatus;
            brandId: string;
            latitude: number | null;
            longitude: number | null;
            timezone: string;
            whatsapp: string | null;
            taxBps: number;
            serviceChargeBps: number;
            minOrderAmount: number | null;
            paymentTimeoutSec: number;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
            deletedAt: Date | null;
        };
    }>;
    get(id: string): Promise<{
        brands: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            slug: string;
            deletedAt: Date | null;
            logoUrl: string | null;
            description: string | null;
        }[];
        branches: {
            name: string;
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            slug: string;
            address: string | null;
            status: import(".prisma/client").$Enums.BranchStatus;
            brandId: string;
            latitude: number | null;
            longitude: number | null;
            timezone: string;
            whatsapp: string | null;
            taxBps: number;
            serviceChargeBps: number;
            minOrderAmount: number | null;
            paymentTimeoutSec: number;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
            deletedAt: Date | null;
        }[];
        payoutAccounts: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            bankName: string;
            accountName: string;
            accountNumber: string;
            isVerified: boolean;
        }[];
    } & {
        email: string | null;
        name: string;
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        legalName: string | null;
        businessType: string | null;
        picName: string | null;
        address: string | null;
        taxId: string | null;
        status: import(".prisma/client").$Enums.OnboardingStatus;
        platformFeeBps: number | null;
    }>;
    update(id: string, userId: string, dto: Record<string, unknown>): Promise<{
        email: string | null;
        name: string;
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        legalName: string | null;
        businessType: string | null;
        picName: string | null;
        address: string | null;
        taxId: string | null;
        status: import(".prisma/client").$Enums.OnboardingStatus;
        platformFeeBps: number | null;
    }>;
    submitOnboarding(id: string, userId: string): Promise<{
        email: string | null;
        name: string;
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        legalName: string | null;
        businessType: string | null;
        picName: string | null;
        address: string | null;
        taxId: string | null;
        status: import(".prisma/client").$Enums.OnboardingStatus;
        platformFeeBps: number | null;
    }>;
    setPayoutAccount(organizationId: string, userId: string, dto: {
        bankName: string;
        accountName: string;
        accountNumber: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        bankName: string;
        accountName: string;
        accountNumber: string;
        isVerified: boolean;
    }>;
    listMembers(organizationId: string): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            email: string | null;
            name: string | null;
            id: string;
            kindeId: string;
            phone: string | null;
            avatarUrl: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        role: {
            name: string;
            id: string;
            createdAt: Date;
            code: string;
            isSystem: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        organizationId: string;
        userId: string;
        roleId: string;
    })[]>;
    inviteMember(organizationId: string, actorId: string, dto: {
        email: string;
        name?: string;
        roleCode?: string;
    }): Promise<{
        user: {
            email: string | null;
            name: string | null;
            id: string;
            kindeId: string;
            phone: string | null;
            avatarUrl: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        role: {
            name: string;
            id: string;
            createdAt: Date;
            code: string;
            isSystem: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        organizationId: string;
        userId: string;
        roleId: string;
    }>;
    removeMember(organizationId: string, userId: string, actorId: string): Promise<{
        ok: boolean;
    }>;
}
