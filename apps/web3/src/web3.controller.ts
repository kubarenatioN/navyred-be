import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Web3Service } from './web3.service';

@Controller()
export class Web3Controller {
  constructor(private readonly web3Service: Web3Service) {
    console.log('web3 env:', process.env.TEST_ENV);
  }

  @Get()
  getHello(): string {
    return 'Web 3 Server';
  }

  @Get('wallet/:id')
  getWallet(@Param('id', ParseIntPipe) id: number) {
    return {
      id,
      address: '0xuqhe174blad123',
    };
  }
}
