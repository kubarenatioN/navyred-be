import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUnitDTO } from 'apps/game/src/dto';
import { UnitsService } from '../services/units.service';

@Controller('units')
export class UnitsController {
  constructor(private unitsService: UnitsService) {}

  @Get()
  getAll() {
    return this.unitsService.getAll();
  }

  @Post()
  async create(@Body() body: CreateUnitDTO) {
    const created = await this.unitsService.create(body);
    return created;
  }
}
