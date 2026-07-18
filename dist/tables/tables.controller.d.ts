import { AuthUser } from '../common/types';
import { TablesService } from './tables.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class TablesController {
    private readonly service;
    private readonly prisma;
    constructor(service: TablesService, prisma: PrismaService);
    listAreas(user: AuthUser, branchId: string): Promise<({
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
    createArea(user: AuthUser, body: {
        branchId: string;
        name: string;
        type?: string;
    }): Promise<{
        name: string;
        id: string;
        branchId: string;
        type: string;
    }>;
    listTables(user: AuthUser, branchId: string): Promise<({
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
    floorMap(user: AuthUser, branchId: string): Promise<({
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
    createTable(user: AuthUser, body: any): Promise<({
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
    rotate(user: AuthUser, id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        token: string;
        revokedAt: Date | null;
        tableId: string;
    }>;
    status(user: AuthUser, id: string, body: {
        status: string;
    }): Promise<{
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
    position(user: AuthUser, id: string, body: {
        posX: number;
        posY: number;
    }): Promise<{
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
}
