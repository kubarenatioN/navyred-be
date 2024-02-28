import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateRaidDTO } from 'apps/game/src/dto';
import { ProtectedGuard } from 'apps/game/src/guards';
import { RaidService } from '../services/raid.service';

@UseGuards(ProtectedGuard)
@Controller({
  path: 'raids',
  version: '1',
})
export class RaidController {
  constructor(private raidService: RaidService) {}

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.raidService.get(id);
  }

  @Post()
  create(@Body() body: CreateRaidDTO) {
    const { unitId } = body;

    return this.raidService.create({
      unitId,
    });
  }

  @Post(':id/complete')
  completeRaid(@Param('id', ParseIntPipe) id: number) {
    return this.raidService.complete(id);
  }
}
