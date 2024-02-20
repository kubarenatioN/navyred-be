import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raid, RaidStatusEnum, Unit } from 'apps/game/src/entities';
import { In, Repository } from 'typeorm';
import { CreateUnit } from '../models/units.model';

@Injectable()
export class UnitsService {
  private readonly isUpdateStatusOnGet: boolean;

  constructor(
    @InjectRepository(Unit) private unitsRepo: Repository<Unit>,
    @InjectRepository(Raid) private raidRepo: Repository<Raid>,
  ) {
    const { RAID_STATUS_CHECK_STRATEGY } = process.env;
    this.isUpdateStatusOnGet = RAID_STATUS_CHECK_STRATEGY === 'onGet';
  }

  // TODO: add dynamic raid status param
  async getAll() {
    const queryBuilder = this.unitsRepo.createQueryBuilder('units');

    queryBuilder
      .leftJoinAndMapOne(
        'units.raid_in_progress',
        'units.raids',
        'raid1',
        'raid1.status = :status1',
        { status1: RaidStatusEnum.InProgress },
      )
      .leftJoinAndMapOne(
        'units.raid_returned',
        'units.raids',
        'raid2',
        'raid2.status = :status2',
        { status2: RaidStatusEnum.Returned },
      );

    const units = await queryBuilder.getMany();

    return units;
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
      result = await this.updateRaidsStatuses(raids);
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

  private async updateRaidsStatuses(raids: Raid[]): Promise<Raid[]> {
    const currentTime = new Date().getTime();

    const raidsToSave = [];
    for (const raid of raids) {
      const { endAt, status } = raid;
      if (
        status === RaidStatusEnum.InProgress &&
        currentTime >= endAt.getTime()
      ) {
        raid.status = RaidStatusEnum.Returned;
        raidsToSave.push(raid);
      }
    }

    if (raidsToSave.length > 0) {
      await this.raidRepo.save(raidsToSave);
    }

    return raids;
  }
}
