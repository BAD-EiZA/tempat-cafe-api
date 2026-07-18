import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { pickOrgId } from '../common/tenant';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './promotion.dto';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly service: PromotionsService) {}

  @Get()
  @RequirePermissions('menu.manage')
  list(@CurrentUser() user: AuthUser, @Query('organizationId') organizationId?: string) {
    return this.service.list(pickOrgId(user, organizationId));
  }

  @Post()
  @RequirePermissions('menu.manage')
  create(@CurrentUser() user: AuthUser, @Body() body: CreatePromotionDto) {
    body.organizationId = pickOrgId(user, body.organizationId);
    return this.service.create(body);
  }
}
