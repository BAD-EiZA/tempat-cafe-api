import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;
export declare class OutboxService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    publish(eventType: string, aggregateType: string, aggregateId: string, payload: object, tx?: Tx): Promise<{
        payload: Prisma.JsonValue;
        id: string;
        createdAt: Date;
        status: string;
        aggregateType: string;
        aggregateId: string;
        eventType: string;
        attempts: number;
        availableAt: Date;
        processedAt: Date | null;
    }>;
    claimPending(limit?: number): Promise<{
        payload: Prisma.JsonValue;
        id: string;
        createdAt: Date;
        status: string;
        aggregateType: string;
        aggregateId: string;
        eventType: string;
        attempts: number;
        availableAt: Date;
        processedAt: Date | null;
    }[]>;
    markProcessed(id: string): Promise<{
        payload: Prisma.JsonValue;
        id: string;
        createdAt: Date;
        status: string;
        aggregateType: string;
        aggregateId: string;
        eventType: string;
        attempts: number;
        availableAt: Date;
        processedAt: Date | null;
    }>;
    markFailed(id: string, attempts: number): Promise<{
        payload: Prisma.JsonValue;
        id: string;
        createdAt: Date;
        status: string;
        aggregateType: string;
        aggregateId: string;
        eventType: string;
        attempts: number;
        availableAt: Date;
        processedAt: Date | null;
    }>;
}
export {};
