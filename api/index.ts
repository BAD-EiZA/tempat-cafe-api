import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

let app: NestFastifyApplication;

async function getApp() {
  if (!app) {
    app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({ logger: false }),
    );
    app.enableCors({ origin: true, credentials: true });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  const nestApp = await getApp();
  const instance = nestApp.getHttpAdapter().getInstance();
  instance.server.emit('request', req, res);
}
