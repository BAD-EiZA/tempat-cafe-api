import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthUser } from '../common/types';
export declare class PayoutsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(user: AuthUser, organizationId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        items: {
            id: string;
            amount: number;
            referenceType: string;
            referenceId: string;
            payoutBatchId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        amount: number;
        approvedBy: string | null;
        periodStart: Date | null;
        periodEnd: Date | null;
        proofUrl: string | null;
        createdBy: string | null;
    })[]>;
    createBatch(organizationId: string, amount: number, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        amount: number;
        approvedBy: string | null;
        periodStart: Date | null;
        periodEnd: Date | null;
        proofUrl: string | null;
        createdBy: string | null;
    }>;
    submitApproval(id: string, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        amount: number;
        approvedBy: string | null;
        periodStart: Date | null;
        periodEnd: Date | null;
        proofUrl: string | null;
        createdBy: string | null;
    }>;
    approve(id: string, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        amount: number;
        approvedBy: string | null;
        periodStart: Date | null;
        periodEnd: Date | null;
        proofUrl: string | null;
        createdBy: string | null;
    }>;
}
