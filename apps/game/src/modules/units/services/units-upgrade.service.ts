import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit, UnitUpgrade, User } from 'apps/game/src/entities';
import { UnitUpgradeDurationCalculator } from 'apps/game/src/helpers/calculators/units.calculator';
import { addSeconds } from 'date-fns';
import { Repository } from 'typeorm';
import { CreateUpgradeUnit } from '../models';

@Injectable()
export class UnitsUpgradeService {
  constructor(
    @InjectRepository(Unit) private unitsRepo: Repository<Unit>,
    @InjectRepository(UnitUpgrade)
    private unitsUpgradeRepo: Repository<UnitUpgrade>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async upgrade({ unitId, ownerId }: { unitId: number; ownerId: number }) {
    const unit = await this.unitsRepo.findOne({
      relations: {
        owner: true,
      },
      where: {
        id: unitId,
      },
    });

    if (!unit) {
      throw new HttpException('Unit not found', HttpStatus.NOT_FOUND);
    }

    const user = await this.usersRepo.findOneBy({ id: ownerId });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (unit.owner.id !== user.id) {
      throw new HttpException(
        'User is not owner of the unit',
        HttpStatus.FORBIDDEN,
      );
    }

    if (unit.exp < unit.maxExp) {
      throw new HttpException(
        'Not enough experience for upgrade',
        HttpStatus.BAD_REQUEST,
      );
    }

    /**
     * Set temp max level to 10
     */
    if (unit.level >= 10) {
      throw new HttpException(
        'Max level is 10 (temporary)',
        HttpStatus.FORBIDDEN,
      );
    }

    const existing = await this.unitsUpgradeRepo.findOne({
      where: {
        unit: {
          id: unit.id,
        },
        status: 'in_progress',
      },
    });

    if (existing) {
      throw new HttpException(
        'Unit is already updating',
        HttpStatus.BAD_REQUEST,
      );
    }

    const endAt = addSeconds(
      Date.now(),
      UnitUpgradeDurationCalculator.calc(unit.level),
    );

    const payload: CreateUpgradeUnit = {
      unit,
      endAt,
      status: 'in_progress',
    };

    const unitUpgrade = await this.unitsUpgradeRepo.save(payload);

    delete unit.owner;

    return unitUpgrade;
  }
}
