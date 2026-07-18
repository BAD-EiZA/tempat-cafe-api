import { AuthUser } from '../common/types';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './promotion.dto';
export declare class PromotionsController {
    private readonly service;
    constructor(service: PromotionsService);
    list(user: AuthUser, organizationId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        schedules: {
            id: string;
            dayOfWeek: number | null;
            startTime: string | null;
            endTime: string | null;
            promotionId: string;
        }[];
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        organizationId: string;
        branchId: string | null;
        type: string;
        startsAt: Date | null;
        endsAt: Date | null;
        stackable: boolean;
        rules: import("@prisma/client/runtime/library").JsonValue | null;
        priority: number;
    })[]>;
    create(user: AuthUser, body: CreatePromotionDto): import(".prisma/client").Prisma.Prisma__PromotionClient<{
        schedules: {
            id: string;
            dayOfWeek: number | null;
            startTime: string | null;
            endTime: string | null;
            promotionId: string;
        }[];
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        organizationId: string;
        branchId: string | null;
        type: string;
        startsAt: Date | null;
        endsAt: Date | null;
        stackable: boolean;
        rules: import("@prisma/client/runtime/library").JsonValue | null;
        priority: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
