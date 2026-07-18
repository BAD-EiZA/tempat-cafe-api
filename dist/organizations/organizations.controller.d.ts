import { AuthUser } from '../common/types';
import { OrganizationsService } from './organizations.service';
export declare class OrganizationsController {
    private readonly service;
    constructor(service: OrganizationsService);
    list(user: AuthUser): Promise<({
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
    create(user: AuthUser, body: {
        name: string;
        legalName?: string;
        email?: string;
        phone?: string;
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
    get(id: string, user: AuthUser): Promise<{
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
    update(id: string, user: AuthUser, body: Record<string, unknown>): Promise<{
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
    submit(id: string, user: AuthUser): Promise<{
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
    payout(id: string, user: AuthUser, body: {
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
    members(id: string, user: AuthUser): import(".prisma/client").Prisma.PrismaPromise<({
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
    invite(id: string, user: AuthUser, body: {
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
    remove(id: string, userId: string, user: AuthUser): Promise<{
        ok: boolean;
    }>;
}
