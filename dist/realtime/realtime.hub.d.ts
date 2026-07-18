import { Observable } from 'rxjs';
export type RealtimeEvent = {
    type: string;
    branchId?: string;
    organizationId?: string;
    payload: Record<string, unknown>;
    at: string;
};
export declare class RealtimeHub {
    private readonly bus;
    publish(event: Omit<RealtimeEvent, 'at'>): void;
    stream(branchId?: string, organizationId?: string): Observable<RealtimeEvent>;
}
