import { PrismaService } from '../prisma/prisma.service';
export declare class TablesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createArea(branchId: string, name: string, type?: string): import(".prisma/client").Prisma.Prisma__AreaClient<{
        name: string;
        id: string;
        branchId: string;
        type: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    listAreas(branchId: string): import(".prisma/client").Prisma.PrismaPromise<({
        tables: ({
            qrTokens: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                token: string;
                revokedAt: Date | null;
                tableId: string;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            status: import(".prisma/client").$Enums.TableStatus;
            capacity: number;
            posX: number | null;
            posY: number | null;
            areaId: string | null;
        })[];
    } & {
        name: string;
        id: string;
        branchId: string;
        type: string;
    })[]>;
    createTable(dto: {
        branchId: string;
        areaId?: string;
        name: string;
        capacity?: number;
        posX?: number;
        posY?: number;
    }): Promise<({
        qrTokens: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            token: string;
            revokedAt: Date | null;
            tableId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        capacity: number;
        posX: number | null;
        posY: number | null;
        areaId: string | null;
    }) | null>;
    listTables(branchId: string): import(".prisma/client").Prisma.PrismaPromise<({
        area: {
            name: string;
            id: string;
            branchId: string;
            type: string;
        } | null;
        qrTokens: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            token: string;
            revokedAt: Date | null;
            tableId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        capacity: number;
        posX: number | null;
        posY: number | null;
        areaId: string | null;
    })[]>;
    floorMap(branchId: string): import(".prisma/client").Prisma.PrismaPromise<({
        area: {
            name: string;
            id: string;
            branchId: string;
            type: string;
        } | null;
        sessions: {
            id: string;
            branchId: string;
            status: import(".prisma/client").$Enums.TableSessionStatus;
            tableId: string;
            startedAt: Date;
            customerInitiatorId: string | null;
            closedAt: Date | null;
            totalSpending: number;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        capacity: number;
        posX: number | null;
        posY: number | null;
        areaId: string | null;
    })[]>;
    updatePosition(tableId: string, posX: number, posY: number): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        capacity: number;
        posX: number | null;
        posY: number | null;
        areaId: string | null;
    }>;
    rotateQr(tableId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        token: string;
        revokedAt: Date | null;
        tableId: string;
    }>;
    resolveQr(token: string): Promise<{
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
    updateStatus(tableId: string, status: any): import(".prisma/client").Prisma.Prisma__CafeTableClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        capacity: number;
        posX: number | null;
        posY: number | null;
        areaId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
