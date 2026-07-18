import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;
export declare class VouchersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: any): import(".prisma/client").Prisma.Prisma__VoucherClient<{
        codes: {
            id: string;
            isActive: boolean;
            code: string;
            voucherId: string;
        }[];
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        organizationId: string;
        branchId: string | null;
        type: string;
        value: number | null;
        percentBps: number | null;
        minSpend: number;
        maxDiscount: number | null;
        startsAt: Date | null;
        endsAt: Date | null;
        totalLimit: number | null;
        perCustomerLimit: number | null;
        stackable: boolean;
        rules: import("@prisma/client/runtime/library").JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    list(organizationId: string): import(".prisma/client").Prisma.PrismaPromise<({
        codes: {
            id: string;
            isActive: boolean;
            code: string;
            voucherId: string;
        }[];
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        organizationId: string;
        branchId: string | null;
        type: string;
        value: number | null;
        percentBps: number | null;
        minSpend: number;
        maxDiscount: number | null;
        startsAt: Date | null;
        endsAt: Date | null;
        totalLimit: number | null;
        perCustomerLimit: number | null;
        stackable: boolean;
        rules: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    validateAndQuote(code: string, ctx: {
        organizationId: string;
        branchId: string;
        subtotal: number;
        customerId?: string;
    }): Promise<{
        voucherId: string;
        discount: number;
        code: string;
    }>;
    reserve(voucherId: string, orderId: string, customerId?: string, tx?: Tx): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        customerId: string | null;
        voucherId: string;
        orderId: string | null;
        expiresAt: Date;
    }>;
    consume(voucherId: string, orderId: string, amount: number, tx?: Tx): Promise<{
        id: string;
        createdAt: Date;
        customerId: string | null;
        voucherId: string;
        orderId: string;
        amount: number;
    }>;
    release(orderId: string, tx?: Tx): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
}
export {};
