import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './promotion.dto';
export declare class PromotionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreatePromotionDto): import(".prisma/client").Prisma.Prisma__PromotionClient<{
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
    list(organizationId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    bestDiscount(ctx: {
        organizationId: string;
        branchId: string;
        subtotal: number;
        now?: Date;
    }): Promise<{
        discount: number;
        promotionId: string | undefined;
    }>;
}
