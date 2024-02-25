import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserSession } from 'apps/game/src/entities';
import { add } from 'date-fns';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserSession) private sessionRepo: Repository<UserSession>,
  ) {}

  async login(data: { login: string; password: string }) {
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
      expiresAt: add(new Date(), { minutes: 15 }),
    });

    return {
      sessionId: session.id,
    };
  }
}
