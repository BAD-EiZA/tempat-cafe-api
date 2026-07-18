import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser, RequirePermissions } from '../common/decorators';
import { AuthUser } from '../common/types';
import { pickOrgId } from '../common/tenant';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Post('sign-upload')
  @RequirePermissions('homepage.manage')
  sign(
    @CurrentUser() user: AuthUser,
    @Body() body: { organizationId?: string; folder: string },
  ) {
    return this.service.signUpload(pickOrgId(user, body.organizationId), body.folder || 'misc');
  }

  @Post('assets')
  @RequirePermissions('homepage.manage')
  save(@CurrentUser() user: AuthUser, @Body() body: any) {
    body.organizationId = pickOrgId(user, body.organizationId);
    return this.service.saveAsset(body);
  }
}
