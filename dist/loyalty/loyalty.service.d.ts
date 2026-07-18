import { PrismaService } from '../prisma/prisma.service';
export declare class LoyaltyService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findCustomerByPhone(phone: string, organizationId: string): Promise<{
        email: string | null;
        name: string | null;
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        birthDate: Date | null;
    } | null>;
    earnForOrder(orderId: string): Promise<{
        id: string;
        createdAt: Date;
        orderId: string | null;
        expiresAt: Date | null;
        accountId: string;
        entryType: string;
        points: number;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    quoteRedeemDiscount(organizationId: string, points: number): Promise<number>;
    findAccount(customerId: string, organizationId: string): Promise<{
        id: string;
        organizationId: string;
        customerId: string;
        balance: number;
        lifetimeEarned: number;
    } | null>;
    redeem(accountId: string, points: number, orderId?: string, tx?: any): Promise<any>;
    restoreRedeem(orderId: string, tx?: any): Promise<void>;
    adjust(accountId: string, points: number, reason: string): Promise<{
        id: string;
        createdAt: Date;
        orderId: string | null;
        expiresAt: Date | null;
        accountId: string;
        entryType: string;
        points: number;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getAccount(id: string): import(".prisma/client").Prisma.Prisma__LoyaltyAccountClient<({
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
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
