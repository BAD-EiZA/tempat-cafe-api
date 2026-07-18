import { HomepageService } from '../homepage/homepage.service';
import { MenusService } from '../menus/menus.service';
import { TablesService } from '../tables/tables.service';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
export declare class PublicController {
    private readonly homepage;
    private readonly menus;
    private readonly tables;
    private readonly orders;
    private readonly prisma;
    private readonly pricing;
    constructor(homepage: HomepageService, menus: MenusService, tables: TablesService, orders: OrdersService, prisma: PrismaService, pricing: PricingService);
    cafe(slug: string): Promise<{
        slug: string;
        brand: ({
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
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            slug: string;
            deletedAt: Date | null;
            logoUrl: string | null;
            description: string | null;
        }) | null;
        published: boolean;
        sections: never[];
        page?: undefined;
        design?: undefined;
        featuredItems?: undefined;
        activePromos?: undefined;
    } | {
        page: {
            id: string;
            title: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            brand: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                slug: string;
                deletedAt: Date | null;
                logoUrl: string | null;
                description: string | null;
            } | null;
            branch: {
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
            } | null;
        };
        design: import("@prisma/client/runtime/library").JsonValue | undefined;
        sections: {
            id: string;
            sortOrder: number;
            type: string;
            visible: boolean;
            content: import("@prisma/client/runtime/library").JsonValue;
            versionId: string;
        }[];
        featuredItems: any[];
        activePromos: any[];
        published: boolean;
        slug?: undefined;
        brand?: undefined;
    }>;
    cafeBranch(slug: string, branchSlug: string): Promise<{
        slug: string;
        brand: ({
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
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            slug: string;
            deletedAt: Date | null;
            logoUrl: string | null;
            description: string | null;
        }) | null;
        published: boolean;
        sections: never[];
        page?: undefined;
        design?: undefined;
        featuredItems?: undefined;
        activePromos?: undefined;
    } | {
        page: {
            id: string;
            title: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            brand: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                slug: string;
                deletedAt: Date | null;
                logoUrl: string | null;
                description: string | null;
            } | null;
            branch: {
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
            } | null;
        };
        design: import("@prisma/client/runtime/library").JsonValue | undefined;
        sections: {
            id: string;
            sortOrder: number;
            type: string;
            visible: boolean;
            content: import("@prisma/client/runtime/library").JsonValue;
            versionId: string;
        }[];
        featuredItems: any[];
        activePromos: any[];
        published: boolean;
        slug?: undefined;
        brand?: undefined;
    }>;
    menu(slug: string): Promise<{
        branch: {
            id: string;
            name: string;
            organizationId: string;
            taxBps: number;
            serviceChargeBps: number;
            brand: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                slug: string;
                deletedAt: Date | null;
                logoUrl: string | null;
                description: string | null;
            };
        };
        menus: {
            categories: {
                items: {
                    id: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    price: number;
                    images: {
                        id: string;
                        sortOrder: number;
                        menuItemId: string;
                        url: string;
                    }[];
                    labels: string[];
                    allergens: string[];
                    stationId: string | null;
                    variantGroups: ({
                        options: {
                            name: string;
                            id: string;
                            priceDelta: number;
                            variantGroupId: string;
                            isDefault: boolean;
                        }[];
                    } & {
                        name: string;
                        id: string;
                        menuItemId: string;
                        required: boolean;
                        minSelect: number;
                        maxSelect: number;
                    })[];
                    modifierGroups: ({
                        modifiers: {
                            name: string;
                            id: string;
                            stationId: string | null;
                            modifierGroupId: string;
                            priceDelta: number;
                        }[];
                    } & {
                        name: string;
                        id: string;
                        organizationId: string | null;
                        required: boolean;
                        minSelect: number;
                        maxSelect: number;
                    })[];
                }[];
                name: string;
                id: string;
                isActive: boolean;
                sortOrder: number;
                menuId: string;
            }[];
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            brandId: string;
        }[];
    } | {
        menus: never[];
    }>;
    branchMenu(branchId: string): Promise<{
        branch: {
            id: string;
            name: string;
            organizationId: string;
            taxBps: number;
            serviceChargeBps: number;
            brand: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                slug: string;
                deletedAt: Date | null;
                logoUrl: string | null;
                description: string | null;
            };
        };
        menus: {
            categories: {
                items: {
                    id: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    price: number;
                    images: {
                        id: string;
                        sortOrder: number;
                        menuItemId: string;
                        url: string;
                    }[];
                    labels: string[];
                    allergens: string[];
                    stationId: string | null;
                    variantGroups: ({
                        options: {
                            name: string;
                            id: string;
                            priceDelta: number;
                            variantGroupId: string;
                            isDefault: boolean;
                        }[];
                    } & {
                        name: string;
                        id: string;
                        menuItemId: string;
                        required: boolean;
                        minSelect: number;
                        maxSelect: number;
                    })[];
                    modifierGroups: ({
                        modifiers: {
                            name: string;
                            id: string;
                            stationId: string | null;
                            modifierGroupId: string;
                            priceDelta: number;
                        }[];
                    } & {
                        name: string;
                        id: string;
                        organizationId: string | null;
                        required: boolean;
                        minSelect: number;
                        maxSelect: number;
                    })[];
                }[];
                name: string;
                id: string;
                isActive: boolean;
                sortOrder: number;
                menuId: string;
            }[];
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            brandId: string;
        }[];
    }>;
    qr(token: string): Promise<{
        token: string;
        table: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.TableStatus;
            capacity: number;
            area: {
                name: string;
                id: string;
                branchId: string;
                type: string;
            } | null;
            posX: number | null;
            posY: number | null;
        };
        branch: {
            id: string;
            name: string;
            slug: string;
            organizationId: string;
            brand: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                slug: string;
                deletedAt: Date | null;
                logoUrl: string | null;
                description: string | null;
            };
        };
        activeSession: {
            id: string;
            branchId: string;
            status: import(".prisma/client").$Enums.TableSessionStatus;
            tableId: string;
            startedAt: Date;
            customerInitiatorId: string | null;
            closedAt: Date | null;
            totalSpending: number;
        };
    }>;
    validateCart(body: {
        branchId: string;
        items: {
            menuItemId: string;
            quantity: number;
            modifiers?: {
                name: string;
                priceDelta: number;
            }[];
        }[];
        tipAmount?: number;
    }): Promise<import("../pricing/pricing.service").PriceResult | {
        error: string;
    }>;
    checkout(body: any): Promise<({
        items: {
            id: string;
            status: string;
            stationId: string | null;
            menuItemId: string | null;
            notes: string | null;
            orderId: string;
            quantity: number;
            nameSnapshot: string;
            unitPrice: number;
            lineTotal: number;
        }[];
        payments: {
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
        }[];
    } & {
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
    }) | {
        snapToken: string | null;
        clientKey: string;
        mock: any;
        items: ({
            modifiers: {
                id: string;
                priceDelta: number;
                orderItemId: string;
                nameSnapshot: string;
            }[];
        } & {
            id: string;
            status: string;
            stationId: string | null;
            menuItemId: string | null;
            notes: string | null;
            orderId: string;
            quantity: number;
            nameSnapshot: string;
            unitPrice: number;
            lineTotal: number;
        })[];
        payments: {
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
        }[];
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
    order(publicToken: string): Promise<{
        items: ({
            modifiers: {
                id: string;
                priceDelta: number;
                orderItemId: string;
                nameSnapshot: string;
            }[];
        } & {
            id: string;
            status: string;
            stationId: string | null;
            menuItemId: string | null;
            notes: string | null;
            orderId: string;
            quantity: number;
            nameSnapshot: string;
            unitPrice: number;
            lineTotal: number;
        })[];
        statusHistory: {
            id: string;
            createdAt: Date;
            reason: string | null;
            actorId: string | null;
            orderId: string;
            fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
            toStatus: import(".prisma/client").$Enums.OrderStatus;
        }[];
        payments: {
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
        }[];
        kitchenTickets: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            status: import(".prisma/client").$Enums.KitchenTicketStatus;
            stationId: string;
            orderId: string;
            queuedAt: Date;
            readyAt: Date | null;
        }[];
    } & {
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
    reorder(publicToken: string, body: any): Promise<({
        items: {
            id: string;
            status: string;
            stationId: string | null;
            menuItemId: string | null;
            notes: string | null;
            orderId: string;
            quantity: number;
            nameSnapshot: string;
            unitPrice: number;
            lineTotal: number;
        }[];
        payments: {
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
        }[];
    } & {
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
    }) | {
        snapToken: string | null;
        clientKey: string;
        mock: any;
        items: ({
            modifiers: {
                id: string;
                priceDelta: number;
                orderItemId: string;
                nameSnapshot: string;
            }[];
        } & {
            id: string;
            status: string;
            stationId: string | null;
            menuItemId: string | null;
            notes: string | null;
            orderId: string;
            quantity: number;
            nameSnapshot: string;
            unitPrice: number;
            lineTotal: number;
        })[];
        payments: {
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
        }[];
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
}
