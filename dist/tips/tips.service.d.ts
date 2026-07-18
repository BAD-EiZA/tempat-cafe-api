import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;
export declare class TipsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createForOrder(orderId: string, amount: number, tx?: Tx): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        orderId: string;
        amount: number;
        allocationMode: string;
        paymentId: string | null;
    }>;
    listByBranch(branchId: string): import(".prisma/client").Prisma.PrismaPromise<({
        order: {
            idempotencyKey: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            branchId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            type: import(".prisma/client").$Enums.OrderType;
            tableId: string | null;
            tableSessionId: string | null;
            customerId: string | null;
            orderNumber: string;
            publicToken: string;
            customerName: string | null;
            customerPhone: string | null;
            customerEmail: string | null;
            notes: string | null;
            subtotal: number;
            discountTotal: number;
            taxTotal: number;
            serviceChargeTotal: number;
            tipTotal: number;
            grandTotal: number;
            voucherId: string | null;
        };
        allocations: {
            id: string;
            userId: string | null;
            status: string;
            amount: number;
            poolCode: string | null;
            tipId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        orderId: string;
        amount: number;
        allocationMode: string;
        paymentId: string | null;
    })[]>;
    allocateToStaff(tipId: string, splits: {
        userId: string;
        amount: number;
    }[]): Promise<{
        allocations: {
            id: string;
            userId: string | null;
            status: string;
            amount: number;
            poolCode: string | null;
            tipId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        orderId: string;
        amount: number;
        allocationMode: string;
        paymentId: string | null;
    }>;
}
export {};
