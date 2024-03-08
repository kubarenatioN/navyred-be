import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Raid,
  RaidStatusEnum,
  Unit,
  UserAccount,
} from 'apps/game/src/entities';
import {
  RaidDurationCalculator,
  RaidExpCalculator,
  RaidGoldCalculator,
} from 'apps/game/src/helpers/calculators/units.calculator';
import { add } from 'date-fns';
import { In, Repository } from 'typeorm';
import { CreateRaid, RaidCompleteResponse } from '../models';

@Injectable()
export class RaidService {
  constructor(
    @InjectRepository(Raid) private raidRepo: Repository<Raid>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    @InjectRepository(UserAccount) private userAccRepo: Repository<UserAccount>,
  ) {}

  async get(id: number) {
    const raid = await this.raidRepo.findOneBy({ id });

    if (!raid) {
      throw new HttpException('No raid found.', HttpStatus.NOT_FOUND);
    }

    /**
     * One one element in array
     */
    const [result] = await this.fixRaidsStatus([raid]);
    return result;
  }

  async create(data: CreateRaid, ownerId: number) {
    const { unitId } = data;
    const startAt = new Date();

    const unit = await this.unitRepo.findOne({
      relations: {
        owner: true,
      },
      where: {
        id: unitId,
      },
    });

    if (!unit) {
      throw new HttpException('Unit not found', HttpStatus.BAD_REQUEST);
    }

    /**
     * Check unit owner validity
     */
    if (unit.owner.id !== ownerId) {
      throw new HttpException(
        'Unit does not belong to sender',
        HttpStatus.FORBIDDEN,
      );
    }

    const activeRaid = await this.raidRepo.findOneBy({
      unit: {
        id: unitId,
      },
      status: In([RaidStatusEnum.InProgress, RaidStatusEnum.Returned]),
    });

    /**
     * Check if unit already in a raid
     * If so, then skip execution and send 400 error
     * Else, continue
     */
    if (activeRaid != null) {
      throw new HttpException('Unit already in raid.', HttpStatus.BAD_REQUEST);
    }

    const now = new Date();
    const endAt = add(now, {
      seconds: RaidDurationCalculator.calc(unit.level),
    });
    const expGained = RaidExpCalculator.calc(unit.level);
    const goldLoot = RaidGoldCalculator.calc(unit.level);

    delete unit.owner;

    const inserted = await this.raidRepo.save({
      unit,
      startAt,
      endAt,
      goldLoot,
      exp: expGained,
    });

    delete inserted.goldLoot;
    delete inserted.exp;

    return inserted;
  }

  /**
   * Completes raid, tops up related user account gold balance
   *
   * @param id raid ID
   */
  async complete(id: number, userId: number): Promise<RaidCompleteResponse> {
    const raid = await this.raidRepo
      .createQueryBuilder('raid')
      .where('raid.id = :id', { id })
      .leftJoinAndSelect('raid.unit', 'unit')
      .leftJoinAndSelect('unit.owner', 'owner')
      .addSelect('raid.goldLoot')
      .addSelect('raid.exp')
      .getOne();

    if (!raid) {
      throw new HttpException('Raid not found.', HttpStatus.NOT_FOUND);
    }

    /**
     * If status is already "completed", throw
     */
    if (raid.status === RaidStatusEnum.Completed) {
      throw new HttpException(
        'Raid have been already completed.',
        HttpStatus.BAD_REQUEST,
      );
    }

    /**
     * Can work with raids which only have status "returned"
     */
    if (raid.status !== RaidStatusEnum.Returned) {
      throw new HttpException(
        'Unit is not returned from the raid yet!',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!raid.unit.owner) {
      throw new Error('No owner found for raid unit.');
    }

    if (raid.unit.owner.id !== userId) {
      throw new HttpException(
        'Sender is not an owner of a unit in raid',
        HttpStatus.FORBIDDEN,
      );
    }

    const userAccount = await this.userAccRepo.findOneBy({
      user: {
        id: userId,
      },
    });

    if (!userAccount) {
      throw new HttpException(
        'Raid unit owner account not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const isRaidGoldLootValid =
      !Number.isNaN(raid.goldLoot) && raid.goldLoot >= 0;
    if (!isRaidGoldLootValid) {
      throw new HttpException(
        'Raid gold loot is invalid.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isRaidExpValid = !Number.isNaN(raid.exp) && raid.exp >= 0;
    if (!isRaidExpValid) {
      throw new HttpException(
        'Raid exp is invalid.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newGoldBalance = userAccount.goldBalance + raid.goldLoot;
    await this.userAccRepo.update(
      { id: userAccount.id },
      {
        goldBalance: newGoldBalance,
      },
    );

    const unit = raid.unit;
    const newExp = unit.exp + raid.exp;
    await this.unitRepo.update(
      { id: unit.id },
      {
        exp: newExp,
      },
    );

    raid.status = RaidStatusEnum.Completed;
    await this.raidRepo.save(raid);

    delete raid.unit.owner;

    raid.unit.exp = newExp;
    return {
      id: raid.id,
      unit: raid.unit,
      goldBalance: newGoldBalance,
    };
  }

  async fixRaidsStatus(raids: Raid[]): Promise<Raid[]> {
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
