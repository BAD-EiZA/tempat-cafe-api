import { AuthUser } from '../common/types';
import { VouchersService } from './vouchers.service';
export declare class VouchersController {
    private readonly service;
    constructor(service: VouchersService);
    list(user: AuthUser, organizationId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    create(user: AuthUser, body: any): import(".prisma/client").Prisma.Prisma__VoucherClient<{
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
    validate(body: {
        code: string;
        organizationId: string;
        branchId: string;
        subtotal: number;
        customerId?: string;
    }): Promise<{
        voucherId: string;
        discount: number;
        code: string;
    }>;
}
