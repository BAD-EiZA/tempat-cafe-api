import { AuthUser } from '../common/types';
import { TipsService } from './tips.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class TipsController {
    private readonly service;
    private readonly prisma;
    constructor(service: TipsService, prisma: PrismaService);
    list(user: AuthUser, branchId: string): Promise<({
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
    allocate(id: string, body: {
        splits: {
            userId: string;
            amount: number;
        }[];
    }): Promise<{
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
