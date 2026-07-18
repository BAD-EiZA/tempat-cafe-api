import { Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators';
import { AuthUser } from '../common/types';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.service.list(user.id);
  }

  @Post(':id/read')
  read(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.markRead(id, user.id);
  }
}
