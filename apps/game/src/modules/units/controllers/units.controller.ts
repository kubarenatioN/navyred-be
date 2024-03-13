import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUnitDTO } from 'apps/game/src/dto';
import { GetUserGuard, ProtectedGuard } from 'apps/game/src/guards';
import { Request } from 'express';
import { UnitsUpgradeService } from '../services';
import { UnitsService } from '../services/units.service';

@UseGuards(ProtectedGuard)
@Controller({
  path: 'units',
  version: '1',
})
export class UnitsController {
  constructor(
    private unitsService: UnitsService,
    private unitUpgradeService: UnitsUpgradeService,
  ) {}

  @UseGuards(GetUserGuard)
  @Get()
  async getAll(@Req() req: Request) {
    return this.unitsService.getAll(req.user.id);
  }

  @UseGuards(GetUserGuard)
  @Post('claim')
  /**
   * Claims unit instance for provided user
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

  @UseGuards(GetUserGuard)
  @Post(':id/upgrade')
  /**
   * Upgrades the unit level
   */
  async upgradeUnit(
    @Req() req: Request,
    @Param('id', ParseIntPipe) unitId: number,
  ) {
    const upgrade = await this.unitUpgradeService.upgrade({
      unitId,
      ownerId: req.user.id,
    });

    return upgrade;
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
