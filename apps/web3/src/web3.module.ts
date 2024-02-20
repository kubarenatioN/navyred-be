import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Web3Controller } from './web3.controller';
import { Web3Service } from './web3.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.web3'],
    }),
  ],
  controllers: [Web3Controller],
  providers: [Web3Service],
})
export class Web3Module {}
