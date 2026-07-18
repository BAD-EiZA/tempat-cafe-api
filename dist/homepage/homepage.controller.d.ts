import { AuthUser } from '../common/types';
import { HomepageService } from './homepage.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class HomepageController {
    private readonly service;
    private readonly prisma;
    constructor(service: HomepageService, prisma: PrismaService);
    private assertPageAccess;
    list(user: AuthUser, organizationId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    create(user: AuthUser, body: any): import(".prisma/client").Prisma.Prisma__HomepagePageClient<{
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
    draft(user: AuthUser, id: string, body: any): Promise<({
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
    publish(user: AuthUser, id: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        version: number;
        design: import("@prisma/client/runtime/library").JsonValue | null;
        publishedAt: Date | null;
        pageId: string;
    }>;
}
