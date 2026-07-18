import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, { type Express, type Request, type Response } from 'express';
import { AppModule } from '../src/app.module';

let cached: Express | null = null;
let boot: Promise<Express> | null = null;

async function getServer(): Promise<Express> {
  if (cached) return cached;
  if (boot) return boot;

  boot = (async () => {
    const server = express();
    const adapter = new ExpressAdapter(server);
    const app = await NestFactory.create(AppModule, adapter, {
      logger: ['error', 'warn', 'log'],
    });

    const origins = (process.env.CORS_ORIGINS || '*')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    app.enableCors({
      origin: origins.includes('*') ? true : origins,
      credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
    cached = server;
    return server;
  })();

  return boot;
}

export default async function handler(req: Request, res: Response) {
  try {
    const server = await getServer();
    return server(req, res);
  } catch (err: any) {
    console.error('bootstrap failed', err);
    if (!res.headersSent) {
      res.status(500).json({
        message: 'Internal Server Error',
        error: String(err?.message || err),
      });
    }
  }
}
