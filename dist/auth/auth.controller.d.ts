import { AuthUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    me(user: AuthUser): Promise<{
        user: AuthUser;
        memberships: ({
            organization: {
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
            role: {
                name: string;
                id: string;
                createdAt: Date;
                code: string;
                isSystem: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            organizationId: string;
            userId: string;
            roleId: string;
        })[];
    }>;
}
