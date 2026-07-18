import { AuthUser } from '../common/types';
import { PrintersService } from './printers.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class PrintersController {
    private readonly service;
    private readonly prisma;
    constructor(service: PrintersService, prisma: PrismaService);
    create(user: AuthUser, body: any): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        branchId: string;
        type: string;
        host: string | null;
        port: number | null;
    }>;
    list(user: AuthUser, branchId: string): Promise<({
        mappings: {
            id: string;
            stationId: string;
            isPrimary: boolean;
            copies: number;
            printerId: string;
        }[];
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        branchId: string;
        type: string;
        host: string | null;
        port: number | null;
    })[]>;
    map(body: {
        printerId: string;
        stationId: string;
        copies?: number;
    }): import(".prisma/client").Prisma.Prisma__PrinterStationMappingClient<{
        id: string;
        stationId: string;
        isPrimary: boolean;
        copies: number;
        printerId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    register(user: AuthUser, body: {
        branchId: string;
        name: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        branchId: string;
        deviceToken: string;
        lastHeartbeat: Date | null;
        isOnline: boolean;
    }>;
    heartbeat(token: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        branchId: string;
        deviceToken: string;
        lastHeartbeat: Date | null;
        isOnline: boolean;
    }>;
    next(token: string): Promise<({
        printer: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            branchId: string;
            type: string;
            host: string | null;
            port: number | null;
        };
    } & {
        idempotencyKey: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.PrintJobStatus;
        copies: number;
        printerId: string;
        ticketId: string | null;
        claimedAt: Date | null;
        printedAt: Date | null;
    }) | null>;
    ack(id: string, token: string): Promise<{
        idempotencyKey: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.PrintJobStatus;
        copies: number;
        printerId: string;
        ticketId: string | null;
        claimedAt: Date | null;
        printedAt: Date | null;
    }>;
    fail(id: string, token: string, body: {
        error?: string;
    }): Promise<{
        idempotencyKey: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.PrintJobStatus;
        copies: number;
        printerId: string;
        ticketId: string | null;
        claimedAt: Date | null;
        printedAt: Date | null;
    }>;
    retry(id: string): Promise<{
        idempotencyKey: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.PrintJobStatus;
        copies: number;
        printerId: string;
        ticketId: string | null;
        claimedAt: Date | null;
        printedAt: Date | null;
    }>;
    agents(user: AuthUser, branchId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        branchId: string;
        deviceToken: string;
        lastHeartbeat: Date | null;
        isOnline: boolean;
    }[]>;
}
