import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
  app.enableCors({ origin: origins, credentials: true });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // in-memory rate limit (single instance; use gateway for multi-instance prod)
  const hits = new Map<string, { n: number; t: number }>();
  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onRequest', async (req: any, reply: any) => {
      const ip = req.ip || req.headers['x-forwarded-for'] || 'local';
      const path = (req.url || '').split('?')[0];
      const hot =
        path.includes('/public/') ||
        path.includes('/webhooks/') ||
        path.includes('/payments/') ||
        path.includes('/jobs/');
      if (!hot) return;
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

  const config = new DocumentBuilder()
    .setTitle('Cafe Platform API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
