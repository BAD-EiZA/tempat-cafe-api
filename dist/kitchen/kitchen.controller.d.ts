import { AuthUser } from '../common/types';
import { KitchenService } from './kitchen.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class KitchenController {
    private readonly service;
    private readonly prisma;
    constructor(service: KitchenService, prisma: PrismaService);
    list(user: AuthUser, branchId: string, stationId?: string): Promise<({
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
        items: {
            id: string;
            status: string;
            notes: string | null;
            ticketId: string;
            orderItemId: string;
            quantity: number;
            nameSnapshot: string;
        }[];
        station: {
            name: string;
            id: string;
            branchId: string;
            code: string;
            sortOrder: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.KitchenTicketStatus;
        stationId: string;
        orderId: string;
        queuedAt: Date;
        readyAt: Date | null;
    })[]>;
    status(user: AuthUser, id: string, body: {
        status: string;
    }): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.KitchenTicketStatus;
        stationId: string;
        orderId: string;
        queuedAt: Date;
        readyAt: Date | null;
    }>;
}
