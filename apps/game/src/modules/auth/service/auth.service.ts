import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserSession } from 'apps/game/src/entities';
import { genUid } from 'apps/game/src/helpers/uid';
import { add } from 'date-fns';
import { Repository } from 'typeorm';
import {
  UserLogin,
  UserRegister,
  UserSessionModel,
} from '../models/auth.models';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserSession) private sessionRepo: Repository<UserSession>,
  ) {}

  async getSession(uid: string) {
    if (!uid) {
      throw new HttpException('No session id provided', HttpStatus.BAD_REQUEST);
    }

    const session = await this.sessionRepo.findOneBy({ uid });

    if (!session) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }

    const user = await this.userRepo.findOneBy({ id: session.userId });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    delete user.password;
    return user;
  }

  async login(data: UserLogin) {
    /**
     * TODO: hash passwords
     */
    const { login, password } = data;

    const user = await this.userRepo.findOneBy({
      login,
      password,
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const session = await this.sessionRepo.save({
      userId: user.id,
      uid: genUid(),
      expiredAt: add(new Date(), { minutes: 15 }),
    });

    delete user.password;
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

    const existingUser = await this.userRepo
      .createQueryBuilder('user')
      .where('user.login = :login', {
        login,
      })
      .andWhere('user.password = :password', { password })
      .getOne();

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const newUser = await this.userRepo.save({ login, password });

    const session: UserSessionModel = {
      userId: newUser.id,
      uid: genUid(),
      expiredAt: add(Date.now(), {
        minutes: 15,
      }),
    };

    const newSession = await this.sessionRepo.save(session);

    delete newUser.password;

    return {
      user: newUser,
      session: newSession.uid,
    };
  }
}
