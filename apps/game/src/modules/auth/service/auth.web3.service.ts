import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  accessTokenLifespan,
  refreshTokenLifespan,
} from 'apps/game/src/constants';
import { User, UserSession } from 'apps/game/src/entities';
import { RefreshToken } from 'apps/game/src/entities/RefreshToken.entity';
import { signAccess, signRefresh } from 'apps/game/src/helpers/auth';
import { add } from 'date-fns';
import { Repository } from 'typeorm';
import { UnitsService } from '../../units/services';
import { UserRead } from '../../user/models';
import { UserService } from '../../user/services';
import { Web3AuthLogin } from '../models';

@Injectable()
export class Web3AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserSession) private sessionRepo: Repository<UserSession>,
    @InjectRepository(RefreshToken)
    private refreshRepo: Repository<RefreshToken>,
    private unitsService: UnitsService,
    private userService: UserService,
  ) {}

  async login(address: string): Promise<Web3AuthLogin> {
    let user: UserRead = undefined;

    const existingUser = await this.getUserByWallet(address);

    if (existingUser) {
      user = existingUser;
    } else {
      const newUser = await this.register({ address });
      user = newUser;
    }

    if (!user) {
      throw new HttpException(
        'User is not defined.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const refreshToken = signRefresh({
      payload: {
        userId: user.id,
      },
      expiresIn: refreshTokenLifespan,
    });

    const refresh = await this.refreshRepo.save({
      token: refreshToken,
      user,
      expiresIn: add(new Date(), {
        days: 5,
      }),
    });

    const accessToken = signAccess({
      payload: {
        userId: user.id,
        address,
        refreshId: refresh.id,
      },
      expiresIn: accessTokenLifespan,
    });

    return {
      user,
      accessToken,
      refresh,
    };
  }

  async getUserByWallet(address: string): Promise<User | null> {
    const user = await this.userService.getUserRaw({
      walletAddress: address,
    });

    return user;
  }

  async register(data: { address: string }): Promise<UserRead> {
    const { address } = data;

    const existingUser = await this.userRepo.findOne({
      where: {
        walletAddress: address,
      },
    });

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.create({ address });

    /**
     * TEMP: Add one unit for user by default
     * In future implement "random unit drop" feature for new users
     */
    await this.unitsService.claim({ unitId: 1, ownerId: user.id });

    return user;
  }
}
