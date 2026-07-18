import { AuthUser } from '../common/types';
import { PlatformAdminService } from './platform-admin.service';
import { PayoutsService } from '../payouts/payouts.service';
export declare class PlatformAdminController {
    private readonly service;
    private readonly payouts;
    constructor(service: PlatformAdminService, payouts: PayoutsService);
    merchants(q?: string): import(".prisma/client").Prisma.PrismaPromise<({
        branches: {
            name: string;
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            slug: string;
            address: string | null;
            status: import(".prisma/client").$Enums.BranchStatus;
            brandId: string;
            latitude: number | null;
            longitude: number | null;
            timezone: string;
            whatsapp: string | null;
            taxBps: number;
            serviceChargeBps: number;
            minOrderAmount: number | null;
            paymentTimeoutSec: number;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
            deletedAt: Date | null;
        }[];
        balances: {
            id: string;
            updatedAt: Date;
            organizationId: string;
            available: number;
            pending: number;
            reserved: number;
            tipPayable: number;
        }[];
    } & {
        email: string | null;
        name: string;
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        legalName: string | null;
        businessType: string | null;
        picName: string | null;
        address: string | null;
        taxId: string | null;
        status: import(".prisma/client").$Enums.OnboardingStatus;
        platformFeeBps: number | null;
    })[]>;
    status(id: string, body: {
        status: string;
        reason?: string;
    }, user: AuthUser): Promise<{
        email: string | null;
        name: string;
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        legalName: string | null;
        businessType: string | null;
        picName: string | null;
        address: string | null;
        taxId: string | null;
        status: import(".prisma/client").$Enums.OnboardingStatus;
        platformFeeBps: number | null;
    }>;
    payments(): import(".prisma/client").Prisma.PrismaPromise<({
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
    } & {
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
    })[]>;
    recon(): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        notes: string | null;
        paymentId: string | null;
        providerTxId: string | null;
        internalAmount: number | null;
        providerAmount: number | null;
    }[] | {
        id: string;
        type: string;
        status: string;
        amount: number;
        providerTxId: string | null;
        orderId: string;
        paidAt: Date | null;
        createdAt: Date;
    }[]>;
    runRecon(): Promise<{
        scanned: number;
        created: number;
        mismatched: number;
    }>;
    audit(organizationId?: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    metrics(): Promise<{
        paymentVolume: number;
        paidCount: number;
        totalPayments: number;
        successRate: number;
        negativeBalances: {
            id: string;
            updatedAt: Date;
            organizationId: string;
            available: number;
            pending: number;
            reserved: number;
            tipPayable: number;
        }[];
        pendingPayouts: number;
    }>;
    createPayout(body: {
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
    adjust(body: {
        organizationId: string;
        amount: number;
        reason: string;
    }, user: AuthUser): Promise<{
        id: string;
        organizationId: string;
        accountId: string;
        entryType: string;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        currency: string;
        referenceType: string;
        referenceId: string;
        debit: number;
        credit: number;
        occurredAt: Date;
        postedAt: Date;
    }>;
    impersonate(organizationId: string, user: AuthUser): Promise<{
        organizationId: string;
        organization: {
            email: string | null;
            name: string;
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            legalName: string | null;
            businessType: string | null;
            picName: string | null;
            address: string | null;
            taxId: string | null;
            status: import(".prisma/client").$Enums.OnboardingStatus;
            platformFeeBps: number | null;
        };
        impersonating: boolean;
        message: string;
    } | null>;
    submitPayout(id: string, user: AuthUser): Promise<{
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
