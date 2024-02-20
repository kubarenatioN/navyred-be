import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raid, Unit, UserAccount } from '../../entities';
import { RaidController } from './controllers/raid.controller';
import { RaidService } from './services/raid.service';

@Module({
  imports: [TypeOrmModule.forFeature([Raid, Unit, UserAccount])],
  providers: [RaidService],
  controllers: [RaidController],
  exports: [RaidService],
})
export class RaidModule {}
