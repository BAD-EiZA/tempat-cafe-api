import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const header = request.headers?.authorization as string | undefined;

    // Optional auth on public routes (merchant token or guest without)
    if (isPublic) {
      if (header?.startsWith('Bearer ')) {
        try {
          const payload = await this.authService.verifyToken(header.slice(7));
          request.user = await this.authService.resolveUser(payload);
          request.authPayload = payload;
        } catch {
          /* guest */
        }
      }
      return true;
    }

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = header.slice(7);
    const payload = await this.authService.verifyToken(token);
    request.user = await this.authService.resolveUser(payload);
    request.authPayload = payload;
    return true;
  }
}
