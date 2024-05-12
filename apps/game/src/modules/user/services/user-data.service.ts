import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'apps/game/src/entities';
import { Repository } from 'typeorm';
import { UserReadQuery } from '../models';

@Injectable()
export class UserDataService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async getUser(query: UserReadQuery): Promise<User> {
    const user = await this.userRepo.findOne({
      where: {
        ...query,
      },
      relations: {
        gameAccount: true,
      },
    });

    return user;
  }
}
