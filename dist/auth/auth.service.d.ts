import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/types';
type JwtPayload = Record<string, unknown> & {
    sub?: string;
};
export declare class AuthService {
    private readonly prisma;
    private readonly config;
    private jwks;
    private joseMod;
    constructor(prisma: PrismaService, config: ConfigService);
    private jose;
    private getJwks;
    verifyToken(token: string): Promise<JwtPayload>;
    resolveUser(payload: JwtPayload): Promise<AuthUser>;
}
export {};
