import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser, Public, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { pickOrgId } from '../common/tenant';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  @Public()
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Public()
  @Post('by-token')
  createByToken(@Body() body: any) {
    if (body.publicToken) return this.service.createFromToken(body.publicToken, body);
    return this.service.create(body);
  }

  @Get()
  @RequirePermissions('feedback.respond')
  list(
    @CurrentUser() user: AuthUser,
    @Query('organizationId') organizationId?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.service.list(pickOrgId(user, organizationId), branchId);
  }

  @Post(':id/respond')
  @RequirePermissions('feedback.respond')
  respond(
    @Param('id') id: string,
    @Body() body: { message: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.respond(id, body.message, user.id);
  }
}
