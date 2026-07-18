import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { pickOrgId } from '../common/tenant';
import { HomepageService } from './homepage.service';

@Controller('homepage')
export class HomepageController {
  constructor(private readonly service: HomepageService) {}

  @Get()
  @RequirePermissions('homepage.manage')
  list(@CurrentUser() user: AuthUser, @Query('organizationId') organizationId?: string) {
    return this.service.list(pickOrgId(user, organizationId));
  }

  @Post()
  @RequirePermissions('homepage.manage')
  create(@CurrentUser() user: AuthUser, @Body() body: any) {
    body.organizationId = pickOrgId(user, body.organizationId);
    return this.service.createPage(body);
  }

  @Post(':id/draft')
  @RequirePermissions('homepage.manage')
  draft(@Param('id') id: string, @Body() body: any) {
    return this.service.updateDraft(id, body);
  }

  @Post(':id/publish')
  @RequirePermissions('homepage.manage')
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }
}
