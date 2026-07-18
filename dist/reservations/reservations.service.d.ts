import { Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TableSessionsService } from '../table-sessions/table-sessions.service';
import { OutboxService } from '../outbox/outbox.service';
export declare class ReservationsService {
    private readonly prisma;
    private readonly sessions;
    private readonly outbox;
    constructor(prisma: PrismaService, sessions: TableSessionsService, outbox: OutboxService);
    getOrCreateSettings(branchId: string): Promise<{
        id: string;
        branchId: string;
        settings: Prisma.JsonValue | null;
        enabled: boolean;
        slotMinutes: number;
        bufferMinutes: number;
        minGuests: number;
        maxGuests: number;
        cutoffMinutes: number;
        depositRequired: boolean;
        depositAmount: number | null;
        noShowMinutes: number;
    }>;
    updateSettings(branchId: string, dto: Record<string, unknown>): Prisma.Prisma__ReservationSettingClient<{
        id: string;
        branchId: string;
        settings: Prisma.JsonValue | null;
        enabled: boolean;
        slotMinutes: number;
        bufferMinutes: number;
        minGuests: number;
        maxGuests: number;
        cutoffMinutes: number;
        depositRequired: boolean;
        depositAmount: number | null;
        noShowMinutes: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    private validateRequest;
    private expirePending;
    availability(branchId: string, startAt: Date, guestCount: number): Promise<{
        available: boolean;
        depositRequired: boolean;
        depositAmount: number | null;
        tables: {
            id: string;
            name: string;
            capacity: number;
        }[];
        slot: {
            startAt: Date;
            endAt: Date;
        };
    }>;
    create(dto: {
        branchId: string;
        customerName?: string;
        guestName?: string;
        customerPhone?: string;
        guestPhone?: string;
        customerEmail?: string;
        guestCount: number;
        startAt: string;
        tableIds?: string[];
        specialRequest?: string;
        notes?: string;
    }): Promise<{
        paymentRequired: boolean;
        paymentExpiresAt: Date | null;
        tables: {
            tableId: string;
            reservationId: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        code: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        customerId: string | null;
        customerName: string;
        customerPhone: string | null;
        customerEmail: string | null;
        depositAmount: number;
        depositPaid: boolean;
        guestCount: number;
        startAt: Date;
        endAt: Date;
        specialRequest: string | null;
    }>;
    list(branchId: string, from?: string, to?: string): Prisma.PrismaPromise<({
        tables: ({
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
        } & {
            tableId: string;
            reservationId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        code: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        customerId: string | null;
        customerName: string;
        customerPhone: string | null;
        customerEmail: string | null;
        depositAmount: number;
        depositPaid: boolean;
        guestCount: number;
        startAt: Date;
        endAt: Date;
        specialRequest: string | null;
    })[]>;
    updateStatus(id: string, status: ReservationStatus, actorId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        code: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        customerId: string | null;
        customerName: string;
        customerPhone: string | null;
        customerEmail: string | null;
        depositAmount: number;
        depositPaid: boolean;
        guestCount: number;
        startAt: Date;
        endAt: Date;
        specialRequest: string | null;
    }>;
    confirmDeposit(id: string, actorId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        code: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        customerId: string | null;
        customerName: string;
        customerPhone: string | null;
        customerEmail: string | null;
        depositAmount: number;
        depositPaid: boolean;
        guestCount: number;
        startAt: Date;
        endAt: Date;
        specialRequest: string | null;
    }>;
}
