"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeController = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const decorators_1 = require("../common/decorators");
const realtime_hub_1 = require("./realtime.hub");
const prisma_service_1 = require("../prisma/prisma.service");
const auth_service_1 = require("../auth/auth.service");
const tenant_1 = require("../common/tenant");
let RealtimeController = class RealtimeController {
    constructor(hub, prisma, auth) {
        this.hub = hub;
        this.prisma = prisma;
        this.auth = auth;
    }
    async stream(branchId, accessToken) {
        if (!accessToken)
            throw new common_1.UnauthorizedException('access_token required');
        const payload = await this.auth.verifyToken(accessToken);
        const user = await this.auth.resolveUser(payload);
        if (branchId && !(0, tenant_1.isPlatformAdmin)(user)) {
            await (0, tenant_1.assertBranchAccess)(this.prisma, user, branchId);
        }
        return this.hub.stream(branchId).pipe((0, rxjs_1.map)((e) => ({
            data: e,
            type: e.type,
            id: e.at,
        })));
    }
    async orderTrack(publicToken) {
        if (!publicToken)
            throw new common_1.BadRequestException('publicToken required');
        const order = await this.prisma.order.findUnique({
            where: { publicToken },
            select: { id: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.hub.stream().pipe((0, rxjs_1.filter)((e) => e.payload?.orderId === order.id), (0, rxjs_1.map)((e) => ({ data: e, type: e.type, id: e.at })));
    }
};
exports.RealtimeController = RealtimeController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Sse)('stream'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Query)('access_token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RealtimeController.prototype, "stream", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Sse)('order'),
    __param(0, (0, common_1.Query)('publicToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RealtimeController.prototype, "orderTrack", null);
exports.RealtimeController = RealtimeController = __decorate([
    (0, common_1.Controller)('realtime'),
    __metadata("design:paramtypes", [realtime_hub_1.RealtimeHub,
        prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], RealtimeController);
//# sourceMappingURL=realtime.controller.js.map