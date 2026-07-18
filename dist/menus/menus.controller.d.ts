import { AuthUser } from '../common/types';
import { MenusService } from './menus.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class MenusController {
    private readonly service;
    private readonly prisma;
    constructor(service: MenusService, prisma: PrismaService);
    private menuOrg;
    private itemOrg;
    list(user: AuthUser, brandId?: string, branchId?: string, organizationId?: string): Promise<({
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
    createMenu(user: AuthUser, body: {
        brandId: string;
        branchId?: string;
        name: string;
    }): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        brandId: string;
    }>;
    createCategory(user: AuthUser, body: {
        menuId: string;
        name: string;
        sortOrder?: number;
    }): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        sortOrder: number;
        menuId: string;
    }>;
    createItem(user: AuthUser, body: any): Promise<{
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
    updateItem(user: AuthUser, id: string, body: Record<string, unknown>): Promise<{
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
    soldOut(user: AuthUser, id: string, body: {
        branchId: string;
        isSoldOut?: boolean;
    }): Promise<{
        id: string;
        branchId: string;
        menuItemId: string;
        price: number | null;
        isAvailable: boolean;
        isSoldOut: boolean;
    }>;
    createMg(user: AuthUser, body: any): import(".prisma/client").Prisma.Prisma__ModifierGroupClient<{
        name: string;
        id: string;
        organizationId: string | null;
        required: boolean;
        minSelect: number;
        maxSelect: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    createMod(user: AuthUser, body: any): Promise<{
        name: string;
        id: string;
        stationId: string | null;
        modifierGroupId: string;
        priceDelta: number;
    }>;
    link(user: AuthUser, id: string, body: {
        modifierGroupId: string;
    }): Promise<{
        sortOrder: number;
        menuItemId: string;
        modifierGroupId: string;
    }>;
    stations(user: AuthUser, branchId: string): Promise<{
        name: string;
        id: string;
        branchId: string;
        code: string;
        sortOrder: number;
    }[]>;
}
