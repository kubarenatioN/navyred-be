import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserSession } from 'apps/game/src/entities';
import { catchTokenError, verifyAccess } from 'apps/game/src/helpers/auth';
import { genUid } from 'apps/game/src/helpers/uid';
import { add, differenceInMilliseconds } from 'date-fns';
import { Repository } from 'typeorm';
import { UnitsService } from '../../units/services';
import { UserRead } from '../../user/models';
import { UserService } from '../../user/services';
import {
  UserLogin,
  UserRegister,
  UserSessionModel,
} from '../models/auth.models';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserSession) private sessionRepo: Repository<UserSession>,
    private tokenService: TokenService,
    private unitsService: UnitsService,
    private userService: UserService,
  ) {}

  /**
   * Returns user object by provided session ID
   *
   * @param uid session uid
   */
  async getUserBySession(uid: string): Promise<UserRead> {
    if (!uid) {
      throw new HttpException('No session id provided', HttpStatus.NOT_FOUND);
    }

    const session = await this.getUserSession(uid);

    const now = new Date();
    const isExpired = differenceInMilliseconds(session.expiredAt, now) < 0;
    if (isExpired) {
      throw new HttpException('Session expired', HttpStatus.UNAUTHORIZED);
    }

    return this.userService.getUser({ id: session.userId });
  }

  async getUserByToken(token: string) {
    let userId: number;
    await catchTokenError(() => {
      const { userId: _id } = verifyAccess(token);
      userId = _id;
    });

    return this.userService.getUser({ id: userId });
  }

  async getUserSession(uid: string): Promise<UserSession | null> {
    const session = await this.sessionRepo.findOneBy({ uid });

    return session;
  }

  async login(data: UserLogin) {
    /**
     * TODO: hash passwords
     */
    const { login, password } = data;

    const user = await this.userService.getUser({
      login,
      password,
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const session = await this.sessionRepo.save({
      userId: user.id,
      uid: genUid(),
      expiredAt: add(new Date(), { minutes: 30 }),
    });

    return {
      user,
      session: session.uid,
    };
  }

  async register(data: UserRegister) {
    const { login } = data;
    let { password } = data;
    /**
     * TODO: add password hashing here
     */
    password = (function hashPassword(payload: string) {
      return payload;
    })(password);

    const existingUser = await this.userRepo.findOne({
      where: {
        login,
        password,
      },
    });

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.create({ login, password });

    /**
     * TEMP: Add one unit for user by default
     * In future implement "random unit drop" feature for new users
     */
    await this.unitsService.claim({ unitId: 1, ownerId: user.id });

    const session: UserSessionModel = {
      userId: user.id,
      uid: genUid(),
      expiredAt: add(Date.now(), {
        minutes: 30,
      }),
    };

    const newSession = await this.sessionRepo.save(session);

    return {
      user,
      session: newSession.uid,
    };
  }

  async logout(userId: number) {
    await this.tokenService.deleteUserTokens(userId);
  }
}
