import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console,
  });
  const configService = app.get(ConfigService);
  mongoose.set('debug', configService.get('env') === 'local');
  await app.listen(configService.get('port'));
}

bootstrap();
