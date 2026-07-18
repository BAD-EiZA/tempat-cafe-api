import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(input: {
        organizationId?: string;
        actorId?: string;
        action: string;
        entityType: string;
        entityId?: string;
        before?: unknown;
        after?: unknown;
        ip?: string;
        userAgent?: string;
        reason?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        before: import("@prisma/client/runtime/library").JsonValue | null;
        after: import("@prisma/client/runtime/library").JsonValue | null;
        ip: string | null;
        userAgent: string | null;
        reason: string | null;
        actorId: string | null;
    }>;
}
