import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserAccount } from 'apps/game/src/entities';
import { Repository } from 'typeorm';
import { UserRead, UserReadQuery } from '../models';
import { UserDataService } from './user-data.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserAccount) private userAccRepo: Repository<UserAccount>,
    private dataService: UserDataService,
  ) {}

  async getUser(query: UserReadQuery): Promise<User> {
    const user = await this.dataService.getUser(query);

    if (!user || !user.gameAccount) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    delete user.password;

    return user;
  }

  async getUserRaw(query: UserReadQuery): Promise<User> {
    return await this.dataService.getUser(query);
  }

  async getUserSilently(query: UserReadQuery): Promise<User | null> {
    let user: User | null = null;

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
  async create(data: {
    login?: string;
    password?: string;
    address?: string;
  }): Promise<UserRead> {
    const { login, password, address } = data;

    let newUser: User | undefined = undefined;

    // TODO: add password hash
    if (login && password) {
      newUser = await this.saveUserWithPassword(login, password);
    } else if (address) {
      newUser = await this.saveUserWithWalletAddress(address, 'metamask');
    }

    if (!newUser) {
      throw new HttpException(
        'Unable to create new user. Not enough data provided.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newAccount = await this.userAccRepo.save({
      user: newUser,
      goldBalance: 10,
    });

    delete newUser.password;

    return {
      ...newUser,
      gameAccount: {
        goldBalance: newAccount.goldBalance,
      },
    };
  }

  private async saveUserWithPassword(
    login: string,
    password: string,
  ): Promise<User> {
    return this.userRepo.save({ login, password });
  }

  private async saveUserWithWalletAddress(
    address: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: 'metamask',
  ): Promise<User> {
    return this.userRepo.save({ walletAddress: address });
  }
}
