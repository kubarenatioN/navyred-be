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
import { CreateRaidDTO } from 'apps/game/src/dto';
import { GetUserGuard, ProtectedGuard } from 'apps/game/src/guards';
import { Request } from 'express';
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
  @UseGuards(GetUserGuard)
  completeRaid(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.raidService.complete(id, req.user.id);
  }
}
