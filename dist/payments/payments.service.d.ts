import { PrismaService } from '../prisma/prisma.service';
import { MidtransService } from '../midtrans/midtrans.service';
import { OrdersService } from '../orders/orders.service';
import { LedgerService } from '../ledger/ledger.service';
import { ConfigService } from '@nestjs/config';
import { AuthUser } from '../common/types';
export declare class PaymentsService {
    private readonly prisma;
    private readonly midtrans;
    private readonly orders;
    private readonly ledger;
    private readonly config;
    constructor(prisma: PrismaService, midtrans: MidtransService, orders: OrdersService, ledger: LedgerService, config: ConfigService);
    assertPaymentAccess(orderId: string, publicToken?: string, user?: AuthUser): Promise<{
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
    }>;
    createSnapForOrder(orderId: string): Promise<{
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
    handleMidtransWebhook(payload: Record<string, any>): Promise<{
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
    private mapStatus;
    mockPay(paymentId: string): Promise<{
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
    expireUnpaid(): Promise<{
        expired: number;
    }>;
    getStatus(paymentId: string): Promise<{
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
    requestRefund(paymentId: string, amount: number, reason: string, userId: string, idempotencyKey: string): Promise<{
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
