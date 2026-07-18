"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({ logger: true }));
    const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
    app.enableCors({ origin: origins, credentials: true });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const hits = new Map();
    app
        .getHttpAdapter()
        .getInstance()
        .addHook('onRequest', async (req, reply) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || 'local';
        const path = (req.url || '').split('?')[0];
        const hot = path.includes('/public/') ||
            path.includes('/webhooks/') ||
            path.includes('/payments/') ||
            path.includes('/jobs/');
        if (!hot)
            return;
        const key = `${ip}:${path}`;
        const now = Date.now();
        let h = hits.get(key);
        if (!h || h.t < now) {
            h = { n: 0, t: now + 60_000 };
            hits.set(key, h);
        }
        h.n += 1;
        const max = path.includes('/webhooks/') ? 300 : 120;
        if (h.n > max) {
            return reply.code(429).send({ message: 'Too many requests' });
        }
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Cafe Platform API')
        .setVersion('0.1.0')
        .addBearerAuth()
        .build();
    swagger_1.SwaggerModule.setup('docs', app, swagger_1.SwaggerModule.createDocument(app, config));
    const port = Number(process.env.PORT || 3000);
    await app.listen(port, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map