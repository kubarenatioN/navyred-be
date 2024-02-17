import { NestFactory } from '@nestjs/core';
import { Web3Module } from './web3.module';

async function bootstrap() {
  const app = await NestFactory.create(Web3Module);
  await app.listen(3001);
}
bootstrap();
