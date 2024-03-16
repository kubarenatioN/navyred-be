import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserAccount, UserSession } from 'apps/game/src/entities';
import { Repository } from 'typeorm';
import { UserRead, UserReadQuery } from '../models';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserSession) private sessionRepo: Repository<UserSession>,
    @InjectRepository(UserAccount) private userAccRepo: Repository<UserAccount>,
  ) {}

  async getUser(query: UserReadQuery): Promise<UserRead> {
    const acc = await this.userAccRepo.findOne({
      relations: {
        user: true,
      },
      where: {
        user: query,
      },
    });

    if (!acc || !acc.user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const { user, goldBalance } = acc;

    delete user.password;

    const result: UserRead = {
      ...user,
      account: {
        goldBalance,
      },
    };

    return result;
  }

  async getUserSession(uid: string): Promise<UserSession> {
    const session = await this.sessionRepo.findOneBy({ uid });

    if (!session) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }

    return session;
  }

  async getUserSilently(query: UserReadQuery) {
    let user: UserRead | null = null;

    try {
      user = await this.getUser(query);
    } catch (error) {
      user = null;
    }

    return user;
  }

  /**
   * Creates new user via login and password
   */
  async create({
    login,
    password,
  }: {
    login: string;
    password: string;
  }): Promise<UserRead> {
    // TODO: add password hash
    const newUser = await this.userRepo.save({ login, password });

    const newAccount = await this.userAccRepo.save({
      user: newUser,
      goldBalance: 0,
    });

    delete newUser.password;

    return {
      ...newUser,
      account: {
        goldBalance: newAccount.goldBalance,
      },
    };
  }
}
