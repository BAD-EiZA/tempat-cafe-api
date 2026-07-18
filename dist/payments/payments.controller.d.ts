import { AuthUser } from '../common/types';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsController {
    private readonly service;
    private readonly config;
    private readonly prisma;
    constructor(service: PaymentsService, config: ConfigService, prisma: PrismaService);
    snap(orderId: string, body: {
        publicToken?: string;
    }, qToken?: string, user?: AuthUser): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            branchId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            orderId: string;
            amount: number;
            method: string | null;
            currency: string;
            provider: string;
            providerOrderId: string | null;
            providerTxId: string | null;
            snapToken: string | null;
            snapRedirectUrl: string | null;
            paidAt: Date | null;
            expiredAt: Date | null;
        };
        snapToken: string | null;
        clientKey: string;
        mock: boolean;
    } | {
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            branchId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            orderId: string;
            amount: number;
            method: string | null;
            currency: string;
            provider: string;
            providerOrderId: string | null;
            providerTxId: string | null;
            snapToken: string | null;
            snapRedirectUrl: string | null;
            paidAt: Date | null;
            expiredAt: Date | null;
        };
        snapToken: string;
        clientKey: string;
        mock?: undefined;
    }>;
    webhook(body: Record<string, any>): Promise<{
        ok: boolean;
        duplicate: boolean;
        unmatched?: undefined;
        alreadyPaid?: undefined;
        status?: undefined;
    } | {
        ok: boolean;
        unmatched: boolean;
        duplicate?: undefined;
        alreadyPaid?: undefined;
        status?: undefined;
    } | {
        ok: boolean;
        alreadyPaid: boolean;
        duplicate?: undefined;
        unmatched?: undefined;
        status?: undefined;
    } | {
        ok: boolean;
        status: any;
        duplicate?: undefined;
        unmatched?: undefined;
        alreadyPaid?: undefined;
    }>;
    status(paymentId: string, publicToken?: string, user?: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        branchId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        orderId: string;
        amount: number;
        method: string | null;
        currency: string;
        provider: string;
        providerOrderId: string | null;
        providerTxId: string | null;
        snapToken: string | null;
        snapRedirectUrl: string | null;
        paidAt: Date | null;
        expiredAt: Date | null;
    }>;
    mockPay(paymentId: string, body: {
        publicToken?: string;
    }, qToken?: string, user?: AuthUser): Promise<{
        ok: boolean;
        duplicate: boolean;
        unmatched?: undefined;
        alreadyPaid?: undefined;
        status?: undefined;
    } | {
        ok: boolean;
        unmatched: boolean;
        duplicate?: undefined;
        alreadyPaid?: undefined;
        status?: undefined;
    } | {
        ok: boolean;
        alreadyPaid: boolean;
        duplicate?: undefined;
        unmatched?: undefined;
        status?: undefined;
    } | {
        ok: boolean;
        status: any;
        duplicate?: undefined;
        unmatched?: undefined;
        alreadyPaid?: undefined;
    }>;
    refund(paymentId: string, body: {
        amount: number;
        reason: string;
        idempotencyKey: string;
    }, user: AuthUser): Promise<{
        idempotencyKey: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        reason: string | null;
        amount: number;
        paymentId: string;
        providerRefundId: string | null;
        requestedBy: string | null;
        approvedBy: string | null;
    }>;
}
