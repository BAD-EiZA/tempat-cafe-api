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
exports.OutboxController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const outbox_worker_1 = require("./outbox.worker");
const config_1 = require("@nestjs/config");
let OutboxController = class OutboxController {
    constructor(worker, config) {
        this.worker = worker;
        this.config = config;
    }
    async process(secret, authorization) {
        const expected = this.config.get('CRON_SECRET') || 'dev-cron';
        const bearer = authorization?.startsWith('Bearer ')
            ? authorization.slice(7).trim()
            : undefined;
        const ok = secret === expected || bearer === expected;
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid cron secret');
        await this.worker.processOnce();
        return { ok: true };
    }
};
exports.OutboxController = OutboxController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('process'),
    __param(0, (0, common_1.Headers)('x-cron-secret')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OutboxController.prototype, "process", null);
exports.OutboxController = OutboxController = __decorate([
    (0, common_1.Controller)('jobs'),
    __metadata("design:paramtypes", [outbox_worker_1.OutboxWorker,
        config_1.ConfigService])
], OutboxController);
//# sourceMappingURL=outbox.controller.js.map