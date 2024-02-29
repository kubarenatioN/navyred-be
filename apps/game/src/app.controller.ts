import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // TODO: remove me
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // TODO: remove me
  @Get('wallet/:id')
  async getWallet(@Param('id', ParseIntPipe) id: number) {
    const response = await fetch(`http://localhost:3001/wallet/${id}`);
    const data = await response.json();
    console.log(data);

    return data;
  }
}
