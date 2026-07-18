import { PrismaService } from '../prisma/prisma.service';
export declare class HomepageService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createPage(dto: {
        organizationId: string;
        brandId?: string;
        branchId?: string;
        slug: string;
        title?: string;
    }): import(".prisma/client").Prisma.Prisma__HomepagePageClient<{
        versions: ({
            sections: {
                id: string;
                sortOrder: number;
                type: string;
                visible: boolean;
                content: import("@prisma/client/runtime/library").JsonValue;
                versionId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            status: string;
            version: number;
            design: import("@prisma/client/runtime/library").JsonValue | null;
            publishedAt: Date | null;
            pageId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        branchId: string | null;
        slug: string;
        brandId: string | null;
        title: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        publishedVersionId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateDraft(pageId: string, dto: {
        design?: object;
        seo?: {
            title?: string;
            description?: string;
        };
        sections?: any[];
    }): Promise<({
        sections: {
            id: string;
            sortOrder: number;
            type: string;
            visible: boolean;
            content: import("@prisma/client/runtime/library").JsonValue;
            versionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        version: number;
        design: import("@prisma/client/runtime/library").JsonValue | null;
        publishedAt: Date | null;
        pageId: string;
    }) | null>;
    publish(pageId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        version: number;
        design: import("@prisma/client/runtime/library").JsonValue | null;
        publishedAt: Date | null;
        pageId: string;
    }>;
    getPublicBySlug(slug: string, branchSlug?: string): Promise<{
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
    list(organizationId: string): import(".prisma/client").Prisma.PrismaPromise<({
        versions: ({
            sections: {
                id: string;
                sortOrder: number;
                type: string;
                visible: boolean;
                content: import("@prisma/client/runtime/library").JsonValue;
                versionId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            status: string;
            version: number;
            design: import("@prisma/client/runtime/library").JsonValue | null;
            publishedAt: Date | null;
            pageId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        branchId: string | null;
        slug: string;
        brandId: string | null;
        title: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        publishedVersionId: string | null;
    })[]>;
}
