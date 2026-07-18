import { AuthUser } from '../common/types';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';
export declare class ReservationsController {
    private readonly service;
    private readonly prisma;
    constructor(service: ReservationsService, prisma: PrismaService);
    availability(body: {
        branchId: string;
        startAt: string;
        guestCount: number;
    }): Promise<{
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
    createPublic(body: any): Promise<{
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
    list(user: AuthUser, branchId: string, from?: string, to?: string): Promise<({
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
    status(id: string, body: {
        status: ReservationStatus;
    }, user: AuthUser): Promise<{
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
    settings(user: AuthUser, body: {
        branchId: string;
    } & Record<string, unknown>): Promise<{
        id: string;
        branchId: string;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
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
    confirmDeposit(user: AuthUser, id: string): Promise<{
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
    noShow(user: AuthUser, id: string): Promise<{
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
