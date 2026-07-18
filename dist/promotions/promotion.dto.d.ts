declare class PromotionRulesDto {
    value?: number;
    percentBps?: number;
    maxDiscount?: number;
}
declare class PromotionScheduleDto {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
}
export declare class CreatePromotionDto {
    organizationId: string;
    branchId?: string;
    name: string;
    type: 'PERCENT' | 'FIXED';
    priority?: number;
    stackable?: boolean;
    startsAt?: string;
    endsAt?: string;
    rules: PromotionRulesDto;
    schedules?: PromotionScheduleDto[];
}
export {};
