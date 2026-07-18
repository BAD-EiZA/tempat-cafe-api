import { AuthUser } from '../common/types';
import { MediaService } from './media.service';
export declare class MediaController {
    private readonly service;
    constructor(service: MediaService);
    sign(user: AuthUser, body: {
        organizationId?: string;
        folder: string;
    }): {
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
    save(user: AuthUser, body: any): Promise<{
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
