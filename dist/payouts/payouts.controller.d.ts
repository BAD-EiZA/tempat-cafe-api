import { AuthUser } from '../common/types';
import { PayoutsService } from './payouts.service';
export declare class PayoutsController {
    private readonly service;
    constructor(service: PayoutsService);
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
    create(body: {
        organizationId: string;
        amount: number;
    }, user: AuthUser): Promise<{
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
    submit(id: string, user: AuthUser): Promise<{
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
