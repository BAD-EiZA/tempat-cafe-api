import { AuthUser } from '../common/types';
import { LedgerService } from './ledger.service';
export declare class LedgerController {
    private readonly service;
    constructor(service: LedgerService);
    list(user: AuthUser, organizationId?: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    balance(user: AuthUser, organizationId?: string): import(".prisma/client").Prisma.Prisma__MerchantBalanceClient<{
        id: string;
        updatedAt: Date;
        organizationId: string;
        available: number;
        pending: number;
        reserved: number;
        tipPayable: number;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
