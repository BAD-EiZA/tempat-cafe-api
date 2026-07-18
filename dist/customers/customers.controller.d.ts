import { AuthUser } from '../common/types';
import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly service;
    constructor(service: CustomersService);
    list(user: AuthUser, organizationId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        customer: {
            memberships: ({
                tier: {
                    name: string;
                    id: string;
                    organizationId: string;
                    code: string;
                    sortOrder: number;
                    minSpend: number;
                    minPoints: number;
                    pointMultiplier: number;
                };
            } & {
                id: string;
                organizationId: string;
                customerId: string;
                joinedAt: Date;
                tierId: string;
            })[];
            loyaltyAccounts: {
                id: string;
                organizationId: string;
                customerId: string;
                balance: number;
                lifetimeEarned: number;
            }[];
        } & {
            email: string | null;
            name: string | null;
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            birthDate: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        organizationId: string;
        customerId: string;
        preferences: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    get(user: AuthUser, id: string, organizationId?: string): import(".prisma/client").Prisma.Prisma__CustomerClient<({
        orders: {
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
        }[];
        memberships: ({
            tier: {
                name: string;
                id: string;
                organizationId: string;
                code: string;
                sortOrder: number;
                minSpend: number;
                minPoints: number;
                pointMultiplier: number;
            };
        } & {
            id: string;
            organizationId: string;
            customerId: string;
            joinedAt: Date;
            tierId: string;
        })[];
        loyaltyAccounts: {
            id: string;
            organizationId: string;
            customerId: string;
            balance: number;
            lifetimeEarned: number;
        }[];
    } & {
        email: string | null;
        name: string | null;
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        birthDate: Date | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    me(user: AuthUser): Promise<{
        email: string | null;
        name: string | null;
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        birthDate: Date | null;
    }>;
}
