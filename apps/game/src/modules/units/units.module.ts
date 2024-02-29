import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raid, Unit, UnitModel, User } from '../../entities';
import { RaidModule } from '../raid/raid.module';
import { UnitsController } from './controllers';
import { UnitsService } from './services/units.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UnitModel, Raid, User, Unit]),
    RaidModule,
  ],
  controllers: [UnitsController],
  providers: [UnitsService],
})
export class UnitsModule {}
