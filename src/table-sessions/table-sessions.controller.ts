import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Public, RequirePermissions } from '../common/decorators';
import { TableSessionsService } from './table-sessions.service';

@Controller('table-sessions')
export class TableSessionsController {
  constructor(private readonly service: TableSessionsService) {}

  @Public()
  @Post()
  open(@Body() body: any) {
    return this.service.open(body);
  }

  @Public()
  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post(':id/close')
  @RequirePermissions('pos.operate')
  close(@Param('id') id: string) {
    return this.service.close(id);
  }
}
