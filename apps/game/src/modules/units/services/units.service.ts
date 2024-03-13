import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Raid,
  RaidStatusEnum,
  Unit,
  UnitModel,
  User,
} from 'apps/game/src/entities';
import { In, Repository } from 'typeorm';
import { RaidService } from '../../raid/services';
import { CreateUnit } from '../models/units.model';
import { UnitsUpgradeService } from './units-upgrade.service';

@Injectable()
export class UnitsService {
  private readonly isUpdateStatusOnGet: boolean;

  constructor(
    @InjectRepository(UnitModel) private unitModelsRepo: Repository<UnitModel>,
    @InjectRepository(Unit) private unitsRepo: Repository<Unit>,
    @InjectRepository(Raid) private raidRepo: Repository<Raid>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private raidsService: RaidService,
    private upgradeService: UnitsUpgradeService,
  ) {
    const { RAID_STATUS_CHECK_STRATEGY } = process.env;
    this.isUpdateStatusOnGet = RAID_STATUS_CHECK_STRATEGY === 'onGet';
  }

  // TODO: add dynamic raid status param
  /**
   * Gets user units with raids
   */
  async getAll(ownerId: number) {
    const userUnits = await this.unitsRepo.find({
      relations: {
        owner: true,
        raids: true,
        model: true,
      },
      where: {
        owner: {
          id: ownerId,
        },
      },
    });

    await this.upgradeService.fixUnitUpgradesStatus(
      userUnits.map((unit) => unit.id),
    );

    /**
     * Fix raids status at the time of request execution
     */
    for (const unit of userUnits) {
      await this.raidsService.fixRaidsStatus(unit.raids);
    }

    const queryBuilder = this.unitsRepo.createQueryBuilder('unit');

    const qb = queryBuilder
      .andWhere('unit.owner = :owner', { owner: ownerId })
      .leftJoinAndMapOne(
        'unit.active_raid',
        'unit.raids',
        'raid',
        'raid.status = :in_progress OR raid.status = :returned',
        {
          in_progress: RaidStatusEnum.InProgress,
          returned: RaidStatusEnum.Returned,
        },
      )
      .leftJoinAndSelect('unit.model', 'model')
      .leftJoinAndMapOne(
        'unit.active_upgrade',
        'unit.upgrades',
        'upgrade',
        'upgrade.status >= :status',
        {
          status: 'in_progress',
          current_time: new Date().toISOString(),
        },
      );

    const result = await qb.getMany();

    return result;
  }

  async claim({ unitId, ownerId }: { unitId: number; ownerId: number }) {
    const owner = await this.usersRepo.findOneBy({ id: ownerId });
    const model = await this.unitModelsRepo.findOneBy({ id: unitId });

    if (!owner) {
      throw new HttpException('Owner not found.', HttpStatus.NOT_FOUND);
    }

    if (!model) {
      throw new HttpException(
        'UnitModel model not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const inserted = await this.unitsRepo.save({
      owner,
      model,
    });

    return inserted;
  }

  async create(data: CreateUnit) {
    // TODO: make important checks (db lookup)
    const saved = await this.unitModelsRepo.save(data);
    return saved;
  }

  async getUnitsRaids(unitsIds?: number[]) {
    const raids = await this.raidRepo.find({
      relations: {
        unit: true,
      },
      where:
        unitsIds && unitsIds.length > 0
          ? {
              unit: {
                id: In(unitsIds),
              },
            }
          : null,
    });

    let result: Raid[] = [];
    if (this.isUpdateStatusOnGet) {
      result = await this.raidsService.fixRaidsStatus(raids);
    }

    /**
     * Don't return raid loot unit if has no "returned" status
     */
    result = result.map((raid) => {
      if (raid.status !== RaidStatusEnum.Returned) {
        delete raid.goldLoot;
      }

      return raid;
    });

    return result;
  }
}
