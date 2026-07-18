import { AuthUser } from '../common/types';
import { FeedbackService } from './feedback.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class FeedbackController {
    private readonly service;
    private readonly prisma;
    constructor(service: FeedbackService, prisma: PrismaService);
    create(body: any): Promise<{
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
    createByToken(body: any): Promise<{
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
    list(user: AuthUser, organizationId?: string, branchId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    respond(id: string, body: {
        message: string;
    }, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        actorId: string | null;
        feedbackId: string;
        message: string;
    }>;
}
