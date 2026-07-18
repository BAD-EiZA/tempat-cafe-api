"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.jwks = null;
        this.joseMod = null;
    }
    async jose() {
        if (!this.joseMod) {
            this.joseMod = await Promise.resolve().then(() => __importStar(require('jose')));
        }
        return this.joseMod;
    }
    async getJwks() {
        if (!this.jwks) {
            const { createRemoteJWKSet } = await this.jose();
            const domain = this.config.get('KINDE_DOMAIN') ||
                this.config.get('KINDE_ISSUER');
            if (!domain)
                throw new common_1.UnauthorizedException('Kinde not configured');
            this.jwks = createRemoteJWKSet(new URL(`${domain.replace(/\/$/, '')}/.well-known/jwks.json`));
        }
        return this.jwks;
    }
    async verifyToken(token) {
        const issuer = this.config.get('KINDE_ISSUER') ||
            this.config.get('KINDE_DOMAIN');
        const audience = this.config.get('KINDE_AUDIENCE');
        try {
            const { jwtVerify } = await this.jose();
            const { payload } = await jwtVerify(token, await this.getJwks(), {
                issuer: issuer?.replace(/\/$/, ''),
                audience: audience || undefined,
            });
            return payload;
        }
        catch {
            const allowDev = this.config.get('NODE_ENV') !== 'production' &&
                this.config.get('ALLOW_DEV_AUTH') === 'true';
            if (allowDev) {
                try {
                    const [, payloadB64] = token.split('.');
                    if (payloadB64) {
                        const json = Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
                        const payload = JSON.parse(json);
                        const now = Math.floor(Date.now() / 1000);
                        if (payload &&
                            typeof payload === 'object' &&
                            typeof payload.sub === 'string' &&
                            payload.sub &&
                            (payload.exp == null || (typeof payload.exp === 'number' && payload.exp > now))) {
                            return payload;
                        }
                    }
                }
                catch {
                }
            }
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async resolveUser(payload) {
        const kindeId = String(payload.sub || '');
        if (!kindeId)
            throw new common_1.UnauthorizedException('Missing sub');
        const emailClaim = payload.email || payload.preferred_username || '';
        const email = emailClaim.trim().toLowerCase() || null;
        const name = payload.name ||
            [payload.given_name, payload.family_name].filter(Boolean).join(' ') ||
            null;
        let user = await this.prisma.user.findUnique({ where: { kindeId } });
        if (!user) {
            user = await this.prisma.$transaction(async (tx) => {
                const existing = await tx.user.findUnique({ where: { kindeId } });
                if (existing)
                    return existing;
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
        }
        else if (!user.isActive) {
            throw new common_1.UnauthorizedException('User suspended');
        }
        else if (email || name) {
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
        const permSet = new Set();
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map