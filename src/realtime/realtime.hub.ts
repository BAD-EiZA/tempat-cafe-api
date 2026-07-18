import { Injectable } from '@nestjs/common';
import { Subject, filter, Observable } from 'rxjs';

export type RealtimeEvent = {
  type: string;
  branchId?: string;
  organizationId?: string;
  payload: Record<string, unknown>;
  at: string;
};

@Injectable()
export class RealtimeHub {
  private readonly bus = new Subject<RealtimeEvent>();

  publish(event: Omit<RealtimeEvent, 'at'>) {
    this.bus.next({ ...event, at: new Date().toISOString() });
  }

  stream(branchId?: string, organizationId?: string): Observable<RealtimeEvent> {
    return this.bus.asObservable().pipe(
      filter((e) => {
        if (branchId && e.branchId && e.branchId !== branchId) return false;
        if (organizationId && e.organizationId && e.organizationId !== organizationId) return false;
        return true;
      }),
    );
  }
}
