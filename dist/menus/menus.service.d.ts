import { PrismaService } from '../prisma/prisma.service';
export declare class MenusService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createMenu(dto: {
        brandId: string;
        branchId?: string;
        name: string;
    }): import(".prisma/client").Prisma.Prisma__MenuClient<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        brandId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    listMenus(organizationId: string, brandId?: string, branchId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        categories: ({
            items: ({
                images: {
                    id: string;
                    sortOrder: number;
                    menuItemId: string;
                    url: string;
                }[];
                branchItems: {
                    id: string;
                    branchId: string;
                    menuItemId: string;
                    price: number | null;
                    isAvailable: boolean;
                    isSoldOut: boolean;
                }[];
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
                modifierLinks: ({
                    modifierGroup: {
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
                    };
                } & {
                    sortOrder: number;
                    menuItemId: string;
                    modifierGroupId: string;
                })[];
            } & {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                deletedAt: Date | null;
                description: string | null;
                sku: string | null;
                basePrice: number;
                estimateMinutes: number | null;
                allergens: string[];
                labels: string[];
                maxPerOrder: number | null;
                categoryId: string;
                stationId: string | null;
            })[];
        } & {
            name: string;
            id: string;
            isActive: boolean;
            sortOrder: number;
            menuId: string;
        })[];
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        brandId: string;
    })[]>;
    createCategory(menuId: string, name: string, sortOrder?: number): import(".prisma/client").Prisma.Prisma__MenuCategoryClient<{
        name: string;
        id: string;
        isActive: boolean;
        sortOrder: number;
        menuId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    createItem(dto: {
        categoryId: string;
        name: string;
        slug: string;
        basePrice: number;
        description?: string;
        stationId?: string;
        labels?: string[];
        allergens?: string[];
    }): import(".prisma/client").Prisma.Prisma__MenuItemClient<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        deletedAt: Date | null;
        description: string | null;
        sku: string | null;
        basePrice: number;
        estimateMinutes: number | null;
        allergens: string[];
        labels: string[];
        maxPerOrder: number | null;
        categoryId: string;
        stationId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateItem(id: string, dto: Record<string, unknown>): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        deletedAt: Date | null;
        description: string | null;
        sku: string | null;
        basePrice: number;
        estimateMinutes: number | null;
        allergens: string[];
        labels: string[];
        maxPerOrder: number | null;
        categoryId: string;
        stationId: string | null;
    }>;
    setBranchAvailability(branchId: string, menuItemId: string, data: {
        price?: number;
        isAvailable?: boolean;
        isSoldOut?: boolean;
    }): import(".prisma/client").Prisma.Prisma__BranchMenuItemClient<{
        id: string;
        branchId: string;
        menuItemId: string;
        price: number | null;
        isAvailable: boolean;
        isSoldOut: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getPublicMenu(branchId: string): Promise<{
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
    createModifierGroup(organizationId: string, name: string, opts?: {
        required?: boolean;
        minSelect?: number;
        maxSelect?: number;
    }): import(".prisma/client").Prisma.Prisma__ModifierGroupClient<{
        name: string;
        id: string;
        organizationId: string | null;
        required: boolean;
        minSelect: number;
        maxSelect: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    addModifier(modifierGroupId: string, name: string, priceDelta?: number, stationId?: string): import(".prisma/client").Prisma.Prisma__ModifierClient<{
        name: string;
        id: string;
        stationId: string | null;
        modifierGroupId: string;
        priceDelta: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    linkModifierGroup(menuItemId: string, modifierGroupId: string, sortOrder?: number): import(".prisma/client").Prisma.Prisma__MenuItemModifierGroupClient<{
        sortOrder: number;
        menuItemId: string;
        modifierGroupId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
