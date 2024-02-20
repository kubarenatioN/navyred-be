import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateRaidDTO } from 'apps/game/src/dto';
import { RaidService } from '../services/raid.service';

@Controller('raids')
export class RaidController {
  constructor(private raidService: RaidService) {}

  @Post()
  create(@Body() body: CreateRaidDTO) {
    const { unitId } = body;

    return this.raidService.create({
      unitId,
    });
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  completeRaid(@Param('id', ParseIntPipe) id: number) {
    return this.raidService.complete(id);
  }
}
