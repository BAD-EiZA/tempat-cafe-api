import { AuthUser } from '../common/types';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly service;
    constructor(service: ReportsService);
    sales(user: AuthUser, organizationId?: string, branchId?: string, from?: string, to?: string): Promise<{
        grossSales: number;
        netSales: number;
        orderCount: number;
        averageOrderValue: number;
        taxTotal: number;
        tipTotal: number;
        discountTotal: number;
        refundCount: number;
        topProducts: {
            name: string;
            qty: number;
            revenue: number;
        }[];
        byHour: {
            hour: number;
            total: number;
        }[];
    }>;
    operations(branchId: string, from?: string, to?: string): Promise<{
        ticketCount: number;
        avgProductionMinutes: number;
        reservations: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.ReservationGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        feedback: {
            count: number;
            avgRating: number | null;
        };
    }>;
}
