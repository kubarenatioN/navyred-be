import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Raid,
  RaidStatusEnum,
  Unit,
  UserAccount,
} from 'apps/game/src/entities';
import { add } from 'date-fns';
import { Repository } from 'typeorm';
import { CreateRaid } from '../models';

@Injectable()
export class RaidService {
  constructor(
    @InjectRepository(Raid) private raidRepo: Repository<Raid>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    @InjectRepository(UserAccount) private userAccRepo: Repository<UserAccount>,
  ) {}

  async get(id: number) {
    const raid = await this.raidRepo.findOneBy({ id });

    /**
     * One one element in array
     */
    const [result] = await this.fixRaidsStatus([raid]);
    return result;
  }

  async create(data: CreateRaid) {
    const { unitId } = data;
    const startAt = new Date();

    /**
     * TODO: Check if unit already in a raid
     * If so, then skip execution and send 4xx error
     * Else, continue
     */

    // TODO: make end time calculations based on unit lvl and so on...
    const endAt = add(new Date(), {
      seconds: 10,
    });

    const unit = await this.unitRepo.findOneBy({
      id: unitId,
    });

    const inserted = await this.raidRepo.save({
      unit,
      startAt,
      endAt,
      goldLoot: Math.random() * 100,
    });

    delete inserted.goldLoot;

    return inserted;
  }

  /**
   * Completes raid, tops up related user account gold balance
   *
   * @param id raid ID
   */
  async complete(id: number) {
    const raid = await this.raidRepo
      .createQueryBuilder('raid')
      .where('raid.id = :id', { id })
      .addSelect('raid.goldLoot')
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

    /**
     * Hard code. Remove it later. Retrieve user ID from request headers
     */
    const userId = 1;
    const userAccount = await this.userAccRepo.findOneBy({
      user: {
        id: userId,
      },
    });

    const isRaidGoldLootValid =
      !Number.isNaN(raid.goldLoot) && raid.goldLoot >= 0;
    if (!isRaidGoldLootValid) {
      throw new HttpException(
        'Raid gold loot is invalid.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    userAccount.goldBalance += raid.goldLoot;
    await this.userAccRepo.save(userAccount);

    raid.status = RaidStatusEnum.Completed;
    await this.raidRepo.save(raid);

    return userAccount;
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
