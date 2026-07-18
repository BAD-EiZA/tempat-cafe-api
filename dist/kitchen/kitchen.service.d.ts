import { KitchenTicketStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OutboxService } from '../outbox/outbox.service';
import { PrintersService } from '../printers/printers.service';
import { OrdersService } from '../orders/orders.service';
export declare class KitchenService {
    private readonly prisma;
    private readonly outbox;
    private readonly printers;
    private readonly orders;
    constructor(prisma: PrismaService, outbox: OutboxService, printers: PrintersService, orders: OrdersService);
    createTicketsForOrder(orderId: string): Promise<any[]>;
    listTickets(branchId: string, stationId?: string): Prisma.PrismaPromise<({
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
    updateTicketStatus(id: string, status: KitchenTicketStatus): Promise<{
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
    private recomputeOrderKitchenStatus;
}
