import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit, UnitUpgrade, User } from 'apps/game/src/entities';
import { UnitUpgradeDurationCalculator } from 'apps/game/src/helpers/calculators/units.calculator';
import { addSeconds, differenceInMilliseconds } from 'date-fns';
import { In, Repository } from 'typeorm';
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
        model: true,
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

    const startAt = new Date();
    // const seconds = 10;
    const seconds = UnitUpgradeDurationCalculator.calc(unit.level);
    const endAt = addSeconds(Date.now(), seconds);

    const payload: CreateUpgradeUnit = {
      unit,
      startAt,
      endAt,
      status: 'in_progress',
    };

    const unitUpgrade = await this.unitsUpgradeRepo.save(payload);

    delete unitUpgrade.unit;

    return unitUpgrade;
  }

  async fixUnitUpgradesStatus(ids: number[]): Promise<Unit[]> {
    const currentTime = Date.now();

    const unitsWithUpgrades = await this.unitsRepo.find({
      relations: {
        upgrades: true,
      },
      where: {
        id: In(ids),
        upgrades: {
          status: 'in_progress',
        },
      },
    });

    const upgradesToSave: UnitUpgrade[] = [];
    const unitsToSave: Unit[] = [];

    for (const unit of unitsWithUpgrades) {
      const upgrade = unit.upgrades.length === 1 ? unit.upgrades[0] : null;

      if (upgrade) {
        const { endAt, status } = upgrade;
        const shouldBeUpdated =
          status === 'in_progress' &&
          differenceInMilliseconds(currentTime, endAt) > 0;

        if (shouldBeUpdated) {
          upgrade.status = 'completed';
          if (unit.level < 10) {
            unit.level += 1;
            unit.exp = 0;
          }

          unitsToSave.push(unit);
          upgradesToSave.push(upgrade);
        }
      } else {
        console.error('Unit has more than one active level upgrade record');
      }
    }

    if (upgradesToSave.length > 0) {
      await this.unitsUpgradeRepo.save(upgradesToSave);
      await this.unitsRepo.save(unitsToSave);
    }

    return unitsWithUpgrades;
  }
}
