import { PrismaService } from '../prisma/prisma.service';
import { OutboxService } from '../outbox/outbox.service';
export declare class FeedbackService {
    private readonly prisma;
    private readonly outbox;
    constructor(prisma: PrismaService, outbox: OutboxService);
    create(dto: {
        orderId: string;
        overallRating: number;
        foodRating?: number;
        drinkRating?: number;
        serviceRating?: number;
        cleanlinessRating?: number;
        speedRating?: number;
        comment?: string;
        tags?: string[];
        isPublic?: boolean;
        contactConsent?: boolean;
        customerId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isPublic: boolean;
        customerId: string | null;
        orderId: string;
        overallRating: number;
        foodRating: number | null;
        drinkRating: number | null;
        serviceRating: number | null;
        cleanlinessRating: number | null;
        speedRating: number | null;
        comment: string | null;
        tags: string[];
        contactConsent: boolean;
    }>;
    createFromToken(publicToken: string, dto: Omit<Parameters<FeedbackService['create']>[0], 'orderId'> & {
        orderId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isPublic: boolean;
        customerId: string | null;
        orderId: string;
        overallRating: number;
        foodRating: number | null;
        drinkRating: number | null;
        serviceRating: number | null;
        cleanlinessRating: number | null;
        speedRating: number | null;
        comment: string | null;
        tags: string[];
        contactConsent: boolean;
    }>;
    list(organizationId?: string, branchId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        order: {
            idempotencyKey: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            branchId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            type: import(".prisma/client").$Enums.OrderType;
            tableId: string | null;
            tableSessionId: string | null;
            customerId: string | null;
            orderNumber: string;
            publicToken: string;
            customerName: string | null;
            customerPhone: string | null;
            customerEmail: string | null;
            notes: string | null;
            subtotal: number;
            discountTotal: number;
            taxTotal: number;
            serviceChargeTotal: number;
            tipTotal: number;
            grandTotal: number;
            voucherId: string | null;
        };
        responses: {
            id: string;
            createdAt: Date;
            actorId: string | null;
            feedbackId: string;
            message: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isPublic: boolean;
        customerId: string | null;
        orderId: string;
        overallRating: number;
        foodRating: number | null;
        drinkRating: number | null;
        serviceRating: number | null;
        cleanlinessRating: number | null;
        speedRating: number | null;
        comment: string | null;
        tags: string[];
        contactConsent: boolean;
    })[]>;
    respond(feedbackId: string, message: string, actorId: string): import(".prisma/client").Prisma.Prisma__FeedbackResponseClient<{
        id: string;
        createdAt: Date;
        actorId: string | null;
        feedbackId: string;
        message: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
