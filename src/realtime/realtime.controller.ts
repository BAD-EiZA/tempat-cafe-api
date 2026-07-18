import { Controller, MessageEvent, Query, Sse, UnauthorizedException } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Public } from '../common/decorators';
import { RealtimeHub } from './realtime.hub';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { assertBranchAccess, isPlatformAdmin } from '../common/tenant';

@Controller('realtime')
export class RealtimeController {
  constructor(
    private readonly hub: RealtimeHub,
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  /**
   * SSE: EventSource cannot send Authorization header → access_token query.
   * GET /api/v1/realtime/stream?branchId=...&access_token=...
   */
  @Public()
  @Sse('stream')
  async stream(
    @Query('branchId') branchId?: string,
    @Query('access_token') accessToken?: string,
  ): Promise<Observable<MessageEvent>> {
    if (!accessToken) throw new UnauthorizedException('access_token required');
    const payload = await this.auth.verifyToken(accessToken);
    const user = await this.auth.resolveUser(payload);
    if (branchId && !isPlatformAdmin(user)) {
      await assertBranchAccess(this.prisma, user, branchId);
    }
    return this.hub.stream(branchId).pipe(
      map((e) => ({
        data: e as any,
        type: e.type,
        id: e.at,
      })),
    );
  }

  @Public()
  @Sse('order')
  orderTrack(@Query('publicToken') publicToken?: string): Observable<MessageEvent> {
    return this.hub.stream().pipe(
      map((e) => {
        if (publicToken && e.payload?.publicToken && e.payload.publicToken !== publicToken) {
          return null as any;
        }
        return { data: e as any, type: e.type, id: e.at };
      }),
    );
  }
}
