import { AuthUser } from '../common/types';
import { BranchesService } from './branches.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class BranchesController {
    private readonly service;
    private readonly prisma;
    constructor(service: BranchesService, prisma: PrismaService);
    list(user: AuthUser, organizationId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
        hours: {
            id: string;
            branchId: string;
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }[];
    } & {
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
    })[]>;
    get(user: AuthUser, id: string): Promise<{
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
        hours: {
            id: string;
            branchId: string;
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }[];
        stations: {
            name: string;
            id: string;
            branchId: string;
            code: string;
            sortOrder: number;
        }[];
    } & {
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
    }>;
    create(user: AuthUser, body: any): import(".prisma/client").Prisma.Prisma__BranchClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(user: AuthUser, id: string, body: Record<string, unknown>): Promise<{
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
    }>;
    hours(user: AuthUser, id: string, body: {
        hours: any[];
    }): Promise<{
        id: string;
        branchId: string;
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
        isClosed: boolean;
    }[]>;
}
