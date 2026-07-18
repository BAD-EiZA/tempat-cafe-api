import { PrismaService } from '../prisma/prisma.service';
import { OutboxService } from '../outbox/outbox.service';
export declare class PrintersService {
    private readonly prisma;
    private readonly outbox;
    constructor(prisma: PrismaService, outbox: OutboxService);
    createDevice(dto: {
        branchId: string;
        name: string;
        type?: string;
        host?: string;
        port?: number;
    }): import(".prisma/client").Prisma.Prisma__PrinterDeviceClient<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        branchId: string;
        type: string;
        host: string | null;
        port: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    mapStation(printerId: string, stationId: string, isPrimary?: boolean, copies?: number): import(".prisma/client").Prisma.Prisma__PrinterStationMappingClient<{
        id: string;
        stationId: string;
        isPrimary: boolean;
        copies: number;
        printerId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    registerAgent(branchId: string, name: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        branchId: string;
        deviceToken: string;
        lastHeartbeat: Date | null;
        isOnline: boolean;
    }>;
    heartbeat(deviceToken: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        branchId: string;
        deviceToken: string;
        lastHeartbeat: Date | null;
        isOnline: boolean;
    }>;
    enqueueForTicket(ticketId: string): Promise<any[]>;
    nextJob(deviceToken: string): Promise<({
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
    ack(jobId: string, deviceToken: string): Promise<{
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
    fail(jobId: string, deviceToken: string, error?: string): Promise<{
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
    retry(jobId: string): Promise<{
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
    listDevices(branchId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    listAgents(branchId: string): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        createdAt: Date;
        branchId: string;
        deviceToken: string;
        lastHeartbeat: Date | null;
        isOnline: boolean;
    }[]>;
    private ensureAgent;
}
