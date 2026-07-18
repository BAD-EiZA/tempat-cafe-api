import { TableSessionsService } from './table-sessions.service';
export declare class TableSessionsController {
    private readonly service;
    constructor(service: TableSessionsService);
    open(body: any): Promise<({
        table: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            status: import(".prisma/client").$Enums.TableStatus;
            capacity: number;
            posX: number | null;
            posY: number | null;
            areaId: string | null;
        };
        participants: {
            id: string;
            tableSessionId: string;
            customerId: string | null;
            displayName: string | null;
            joinedAt: Date;
        }[];
    } & {
        id: string;
        branchId: string;
        status: import(".prisma/client").$Enums.TableSessionStatus;
        tableId: string;
        startedAt: Date;
        customerInitiatorId: string | null;
        closedAt: Date | null;
        totalSpending: number;
    }) | null>;
    get(id: string): Promise<{
        orders: {
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
        }[];
        table: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            status: import(".prisma/client").$Enums.TableStatus;
            capacity: number;
            posX: number | null;
            posY: number | null;
            areaId: string | null;
        };
        participants: {
            id: string;
            tableSessionId: string;
            customerId: string | null;
            displayName: string | null;
            joinedAt: Date;
        }[];
    } & {
        id: string;
        branchId: string;
        status: import(".prisma/client").$Enums.TableSessionStatus;
        tableId: string;
        startedAt: Date;
        customerInitiatorId: string | null;
        closedAt: Date | null;
        totalSpending: number;
    }>;
    close(id: string): Promise<{
        id: string;
        branchId: string;
        status: import(".prisma/client").$Enums.TableSessionStatus;
        tableId: string;
        startedAt: Date;
        customerInitiatorId: string | null;
        closedAt: Date | null;
        totalSpending: number;
    }>;
}
