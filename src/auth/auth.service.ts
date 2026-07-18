import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/types';

type JwtPayload = Record<string, unknown> & { sub?: string };

@Injectable()
export class AuthService {
  private jwks: any = null;
  private joseMod: any = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Dynamic import — jose is ESM-only; Nest/Vercel compile to CJS. */
  private async jose() {
    if (!this.joseMod) {
      this.joseMod = await import('jose');
    }
    return this.joseMod;
  }

  private async getJwks() {
    if (!this.jwks) {
      const { createRemoteJWKSet } = await this.jose();
      const domain =
        this.config.get<string>('KINDE_DOMAIN') ||
        this.config.get<string>('KINDE_ISSUER');
      if (!domain) throw new UnauthorizedException('Kinde not configured');
      this.jwks = createRemoteJWKSet(
        new URL(`${domain.replace(/\/$/, '')}/.well-known/jwks.json`),
      );
    }
    return this.jwks;
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    const issuer =
      this.config.get<string>('KINDE_ISSUER') ||
      this.config.get<string>('KINDE_DOMAIN');
    const audience = this.config.get<string>('KINDE_AUDIENCE');
    try {
      const { jwtVerify } = await this.jose();
      const { payload } = await jwtVerify(token, await this.getJwks(), {
        issuer: issuer?.replace(/\/$/, ''),
        audience: audience || undefined,
      });
      return payload as JwtPayload;
    } catch {
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
            const now = Math.floor(Date.now() / 1000);
            if (
              payload &&
              typeof payload === 'object' &&
              typeof payload.sub === 'string' &&
              payload.sub &&
              (payload.exp == null || (typeof payload.exp === 'number' && payload.exp > now))
            ) {
              return payload;
            }
          }
        } catch {
          /* ignore */
        }
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async resolveUser(payload: JwtPayload): Promise<AuthUser> {
    const kindeId = String(payload.sub || '');
    if (!kindeId) throw new UnauthorizedException('Missing sub');

    const emailClaim =
      (payload.email as string) || (payload.preferred_username as string) || '';
    const email = emailClaim.trim().toLowerCase() || null;
    const name =
      (payload.name as string) ||
      [payload.given_name, payload.family_name].filter(Boolean).join(' ') ||
      null;

    let user = await this.prisma.user.findUnique({ where: { kindeId } });
    if (!user) {
      user = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.user.findUnique({ where: { kindeId } });
        if (existing) return existing;

        const invitation = email
          ? await tx.user.findUnique({ where: { kindeId: `invite-${email}` } })
          : null;
        if (invitation) {
          return tx.user.update({
            where: { id: invitation.id },
            data: { kindeId, email, name: name || invitation.name },
          });
        }
        return tx.user.create({ data: { kindeId, email, name } });
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
