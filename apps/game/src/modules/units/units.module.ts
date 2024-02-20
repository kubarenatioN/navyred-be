import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raid, Unit } from '../../entities';
import { UnitsController } from './controllers';
import { UnitsService } from './services/units.service';

@Module({
  imports: [TypeOrmModule.forFeature([Unit, Raid])],
  controllers: [UnitsController],
  providers: [UnitsService],
})
export class UnitsModule {}
