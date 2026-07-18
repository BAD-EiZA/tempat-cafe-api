import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/types';

@Injectable()
export class AuthService {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getJwks() {
    if (!this.jwks) {
      const domain = this.config.get<string>('KINDE_DOMAIN') || this.config.get<string>('KINDE_ISSUER');
      if (!domain) throw new UnauthorizedException('Kinde not configured');
      this.jwks = createRemoteJWKSet(new URL(`${domain.replace(/\/$/, '')}/.well-known/jwks.json`));
    }
    return this.jwks;
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    const issuer = this.config.get<string>('KINDE_ISSUER') || this.config.get<string>('KINDE_DOMAIN');
    const audience = this.config.get<string>('KINDE_AUDIENCE');
    try {
      const { payload } = await jwtVerify(token, this.getJwks(), {
        issuer: issuer?.replace(/\/$/, ''),
        audience: audience || undefined,
      });
      return payload;
    } catch {
      // Dev fallback: accept unsigned mock tokens when Kinde not set
      // Dev mock JWT only when ALLOW_DEV_AUTH=true and not production
      const allowDev =
        this.config.get('NODE_ENV') !== 'production' &&
        this.config.get('ALLOW_DEV_AUTH') === 'true';
      if (allowDev) {
        try {
          const [, payloadB64] = token.split('.');
          if (payloadB64) {
            const json = Buffer.from(
              payloadB64.replace(/-/g, '+').replace(/_/g, '/'),
              'base64',
            ).toString('utf8');
            const payload = JSON.parse(json);
            if (payload?.sub) return payload;
          }
        } catch {
          /* ignore */
        }
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async resolveUser(payload: JWTPayload): Promise<AuthUser> {
    const kindeId = String(payload.sub || '');
    if (!kindeId) throw new UnauthorizedException('Missing sub');

    const email =
      (payload.email as string) ||
      (payload.preferred_username as string) ||
      null;
    const name =
      (payload.name as string) ||
      [payload.given_name, payload.family_name].filter(Boolean).join(' ') ||
      null;

    let user = await this.prisma.user.findUnique({ where: { kindeId } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { kindeId, email, name },
      });
    } else if (!user.isActive) {
      throw new UnauthorizedException('User suspended');
    } else if (email || name) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email: email || user.email,
          name: name || user.name,
        },
      });
    }

    const orgMembers = await this.prisma.organizationMember.findMany({
      where: { userId: user.id },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    const branchMembers = await this.prisma.branchMember.findMany({
      where: { userId: user.id },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    const permSet = new Set<string>();
    for (const m of [...orgMembers, ...branchMembers]) {
      for (const rp of m.role.permissions) {
        permSet.add(rp.permission.code);
      }
    }

    // Platform super admin by permission on any role
    return {
      id: user.id,
      kindeId: user.kindeId,
      email: user.email,
      name: user.name,
      permissions: [...permSet],
      organizationIds: orgMembers.map((m) => m.organizationId),
    };
  }
}
