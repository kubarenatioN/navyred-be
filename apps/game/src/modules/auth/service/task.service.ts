import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../../../entities';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(UserSession) private sessionRepo: Repository<UserSession>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'disposeExpiredSessions',
  })
  /**
   * Removes stale session records from database once at midnight
   */
  async disposeExpiredSessions() {
    await this.sessionRepo
      .createQueryBuilder()
      .where('expired_at < :now', {
        now: new Date(),
      })
      .delete()
      .execute();
  }
}
