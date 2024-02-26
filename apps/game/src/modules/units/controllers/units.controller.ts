import {
  Body,
  Controller,
  Get,
  ParseArrayPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUnitDTO } from 'apps/game/src/dto';
import { UnitsService } from '../services/units.service';

@Controller({
  path: 'units',
  version: '1',
})
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

  @Get('raids')
  getUnitsRaids(
    @Query(
      'unit_ids',
      new ParseArrayPipe({
        items: Number,
        optional: true,
      }),
    )
    unitsIds?: number[],
  ) {
    return this.unitsService.getUnitsRaids(unitsIds);
  }
}
