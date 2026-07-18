import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser, Public, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { pickOrgId } from '../common/tenant';
import { VouchersService } from './vouchers.service';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly service: VouchersService) {}

  @Get()
  @RequirePermissions('menu.manage')
  list(@CurrentUser() user: AuthUser, @Query('organizationId') organizationId?: string) {
    return this.service.list(pickOrgId(user, organizationId));
  }

  @Post()
  @RequirePermissions('menu.manage')
  create(@CurrentUser() user: AuthUser, @Body() body: any) {
    body.organizationId = pickOrgId(user, body.organizationId);
    return this.service.create(body);
  }

  @Public()
  @Post('validate')
  validate(
    @Body()
    body: {
      code: string;
      organizationId: string;
      branchId: string;
      subtotal: number;
      customerId?: string;
    },
  ) {
    return this.service.validateAndQuote(body.code, body);
  }
}
