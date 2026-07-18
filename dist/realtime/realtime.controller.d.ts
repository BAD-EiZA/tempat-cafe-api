import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RealtimeHub } from './realtime.hub';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
export declare class RealtimeController {
    private readonly hub;
    private readonly prisma;
    private readonly auth;
    constructor(hub: RealtimeHub, prisma: PrismaService, auth: AuthService);
    stream(branchId?: string, accessToken?: string): Promise<Observable<MessageEvent>>;
    orderTrack(publicToken?: string): Promise<Observable<MessageEvent>>;
}
