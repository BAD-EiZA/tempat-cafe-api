import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class PromotionRulesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  value?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10_000)
  percentBps?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxDiscount?: number;
}

class PromotionScheduleDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;
}

export class CreatePromotionDto {
  @IsUUID()
  organizationId!: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsString()
  name!: string;

  @IsIn(['PERCENT', 'FIXED'])
  type!: 'PERCENT' | 'FIXED';

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ValidateNested()
  @Type(() => PromotionRulesDto)
  rules!: PromotionRulesDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionScheduleDto)
  schedules?: PromotionScheduleDto[];
}
