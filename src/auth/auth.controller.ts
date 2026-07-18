import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../common/decorators';
import { AuthUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId: user.id },
      include: {
        organization: {
          include: {
            branches: { orderBy: { createdAt: 'asc' } },
          },
        },
        role: true,
      },
    });
    return { user, memberships };
  }
}
