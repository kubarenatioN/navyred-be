import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('wallet/:id')
  async getWallet(@Param('id', ParseIntPipe) id: number) {
    const response = await fetch(`http://localhost:3001/wallet/${id}`);
    const data = await response.json();
    console.log(data);

    return data;
  }
}
