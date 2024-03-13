import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raid, Unit, UnitModel, UnitUpgrade, User } from '../../entities';
import { RaidModule } from '../raid/raid.module';
import { UnitsController } from './controllers';
import { UnitsUpgradeService } from './services';
import { UnitsService } from './services/units.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UnitModel, Raid, User, Unit, UnitUpgrade]),
    RaidModule,
  ],
  controllers: [UnitsController],
  providers: [UnitsService, UnitsUpgradeService],
})
export class UnitsModule {}
