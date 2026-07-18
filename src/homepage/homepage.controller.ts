import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { assertOrgAccess, pickOrgId } from '../common/tenant';
import { HomepageService } from './homepage.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@Controller('homepage')
export class HomepageController {
  constructor(private readonly service: HomepageService, private readonly prisma: PrismaService) {}

  private async assertPageAccess(user: AuthUser, pageId: string) {
    const page = await this.prisma.homepagePage.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Homepage not found');
    assertOrgAccess(user, page.organizationId);
  }

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
  async draft(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: any) {
    await this.assertPageAccess(user, id);
    return this.service.updateDraft(id, body);
  }

  @Post(':id/publish')
  @RequirePermissions('homepage.manage')
  async publish(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.assertPageAccess(user, id);
    return this.service.publish(id);
  }
}
