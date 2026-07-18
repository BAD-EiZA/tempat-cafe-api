import { LoyaltyService } from './loyalty.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/types';
export declare class LoyaltyController {
    private readonly service;
    private readonly prisma;
    constructor(service: LoyaltyService, prisma: PrismaService);
    private assertAccountAccess;
    get(user: AuthUser, id: string): Promise<({
        entries: {
            id: string;
            createdAt: Date;
            orderId: string | null;
            expiresAt: Date | null;
            accountId: string;
            entryType: string;
            points: number;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        organizationId: string;
        customerId: string;
        balance: number;
        lifetimeEarned: number;
    }) | null>;
    lookup(organizationId: string, phone?: string, customerId?: string): Promise<{
        balance: number;
        customerId?: undefined;
        accountId?: undefined;
        discountPerPoint?: undefined;
    } | {
        customerId: string;
        accountId: string | undefined;
        balance: number;
        discountPerPoint: number;
    } | null>;
    adjust(body: {
        accountId: string;
        points: number;
        reason: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        orderId: string | null;
        expiresAt: Date | null;
        accountId: string;
        entryType: string;
        points: number;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    redeem(body: {
        accountId: string;
        points: number;
        orderId?: string;
    }): Promise<any>;
}
