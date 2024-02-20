import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raid, RaidStatusEnum, Unit } from 'apps/game/src/entities';
import { In, Repository } from 'typeorm';
import { RaidService } from '../../raid/services';
import { CreateUnit } from '../models/units.model';

@Injectable()
export class UnitsService {
  private readonly isUpdateStatusOnGet: boolean;

  constructor(
    @InjectRepository(Unit) private unitsRepo: Repository<Unit>,
    @InjectRepository(Raid) private raidRepo: Repository<Raid>,
    private raidsService: RaidService,
  ) {
    const { RAID_STATUS_CHECK_STRATEGY } = process.env;
    this.isUpdateStatusOnGet = RAID_STATUS_CHECK_STRATEGY === 'onGet';
  }

  // TODO: add dynamic raid status param
  /**
   * Gets user units with raids
   */
  async getAll() {
    // TODO: add here limit or get only user units
    const units = await this.unitsRepo.find({
      relations: { raids: true },
    });

    const userRaids = units.reduce(
      (raids, unit) => {
        raids.push(...unit.raids);
        return raids;
      },
      <Raid[]>[],
    );
    await this.raidsService.fixRaidsStatus(userRaids);

    const queryBuilder = this.unitsRepo.createQueryBuilder('units');

    queryBuilder.leftJoinAndMapOne(
      'units.active_raid',
      'units.raids',
      'raid',
      'raid.status = :in_progress OR raid.status = :returned',
      {
        in_progress: RaidStatusEnum.InProgress,
        returned: RaidStatusEnum.Returned,
      },
    );

    // queryBuilder
    //   .leftJoinAndMapOne(
    //     'units.raid_in_progress',
    //     'units.raids',
    //     'raid1',
    //     'raid1.status = :status1',
    //     { status1: RaidStatusEnum.InProgress },
    //   )
    //   .leftJoinAndMapOne(
    //     'units.active_raid',
    //     'units.raids',
    //     'raid3',
    //     'raid3.status = :in_progress OR raid3.status = :returned',
    //     {
    //       in_progress: RaidStatusEnum.InProgress,
    //       returned: RaidStatusEnum.Returned,
    //     },
    //   )
    //   .leftJoinAndMapOne(
    //     'units.raid_returned',
    //     'units.raids',
    //     'raid2',
    //     'raid2.status = :status2',
    //     { status2: RaidStatusEnum.Returned },
    //   );

    const result = await queryBuilder.getMany();

    return result;
  }

  async create(data: CreateUnit) {
    // TODO: make important checks (db lookup)
    const saved = await this.unitsRepo.save(data);
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
