import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  health() {
    return { status: 'ok', ts: new Date().toISOString() };
  }

  @Public()
  @Get('database')
  async database() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  }

  @Public()
  @Get('readiness')
  async readiness() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ready' };
  }
}
