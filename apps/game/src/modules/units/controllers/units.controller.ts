import {
  Body,
  Controller,
  Get,
  ParseArrayPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUnitDTO } from 'apps/game/src/dto';
import { GetUserGuard, ProtectedGuard } from 'apps/game/src/guards';
import { Request } from 'express';
import { AuthService } from '../../auth/service';
import { UnitsService } from '../services/units.service';

@UseGuards(ProtectedGuard)
@Controller({
  path: 'units',
  version: '1',
})
export class UnitsController {
  constructor(
    private unitsService: UnitsService,
    private authService: AuthService,
  ) {}

  @Get()
  @UseGuards(GetUserGuard)
  async getAll(@Req() req: Request) {
    console.log('req user:', req.user);
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
