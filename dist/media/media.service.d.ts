import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class MediaService {
    private readonly config;
    private readonly prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    signUpload(organizationId: string, folder: string): {
        mock: boolean;
        folder: string;
        timestamp: number;
        uploadUrl: null;
        cloudName?: undefined;
        apiKey?: undefined;
        signature?: undefined;
    } | {
        cloudName: any;
        apiKey: any;
        timestamp: number;
        folder: string;
        signature: string;
        uploadUrl: string;
        mock?: undefined;
    };
    saveAsset(dto: {
        organizationId: string;
        publicId: string;
        url: string;
        resourceType?: string;
        folder?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        url: string;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        publicId: string;
        resourceType: string;
        folder: string | null;
    }>;
}
