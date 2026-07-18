"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
const buckets = new Map();
let RateLimitMiddleware = class RateLimitMiddleware {
    use(req, res, next) {
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.socket?.remoteAddress ||
            'unknown';
        const path = req.url || '';
        const key = `${ip}:${path.split('?')[0]}`;
        const now = Date.now();
        const windowMs = 60_000;
        const max = path.includes('/public/') || path.includes('/webhooks/') ? 120 : 300;
        let b = buckets.get(key);
        if (!b || b.reset < now) {
            b = { count: 0, reset: now + windowMs };
            buckets.set(key, b);
        }
        b.count += 1;
        if (b.count > max) {
            throw new common_1.HttpException('Too many requests', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        next();
    }
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = __decorate([
    (0, common_1.Injectable)()
], RateLimitMiddleware);
//# sourceMappingURL=rate-limit.middleware.js.map