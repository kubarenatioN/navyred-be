import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUnitDTO } from 'apps/game/src/dto';
import { GetUserGuard, ProtectedGuard } from 'apps/game/src/guards';
import { Request } from 'express';
import { UnitsService } from '../services/units.service';

@UseGuards(ProtectedGuard)
@Controller({
  path: 'units',
  version: '1',
})
export class UnitsController {
  constructor(private unitsService: UnitsService) {}

  @UseGuards(GetUserGuard)
  @Get()
  async getAll(@Req() req: Request) {
    return this.unitsService.getAll(req.user.id);
  }

  @UseGuards(GetUserGuard)
  @Post('claim')
  /**
   * Claims unit instance for user
   */
  async claim(
    @Req() req: Request,
    @Body('unitId', ParseIntPipe) unitId: number,
  ) {
    const unit = await this.unitsService.claim({
      unitId,
      ownerId: req.user.id,
    });

    return unit;
  }

  @Post()
  async create(@Body() body: CreateUnitDTO) {
    const created = await this.unitsService.create(body);
    return created;
  }

  // @Get('raids')
  // getUnitsRaids(
  //   @Query(
  //     'unit_ids',
  //     new ParseArrayPipe({
  //       items: Number,
  //       optional: true,
  //     }),
  //   )
  //   unitsIds?: number[],
  // ) {
  //   return this.unitsService.getUnitsRaids(unitsIds);
  // }
}
