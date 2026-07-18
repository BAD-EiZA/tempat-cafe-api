import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class LedgerService {
    private readonly prisma;
    private readonly config;
    constructor(prisma: PrismaService, config: ConfigService);
    private account;
    postSale(paymentId: string): Promise<void>;
    settlePending(olderThanHours?: number): Promise<{
        settled: number;
        scanned: number;
        unusedEntries: number;
    }>;
    postRefund(paymentId: string, amount: number, refundId: string): Promise<void>;
    list(organizationId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        organizationId: string;
        accountId: string;
        entryType: string;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        currency: string;
        referenceType: string;
        referenceId: string;
        debit: number;
        credit: number;
        occurredAt: Date;
        postedAt: Date;
    }[]>;
    balance(organizationId: string): import(".prisma/client").Prisma.Prisma__MerchantBalanceClient<{
        id: string;
        updatedAt: Date;
        organizationId: string;
        available: number;
        pending: number;
        reserved: number;
        tipPayable: number;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    adjust(organizationId: string, amount: number, reason: string, actorId: string): Promise<{
        id: string;
        organizationId: string;
        accountId: string;
        entryType: string;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        currency: string;
        referenceType: string;
        referenceId: string;
        debit: number;
        credit: number;
        occurredAt: Date;
        postedAt: Date;
    }>;
}
