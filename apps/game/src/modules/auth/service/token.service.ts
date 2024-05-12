import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'apps/game/src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(RefreshToken) private tokenRepo: Repository<RefreshToken>,
  ) {}

  async findOne(query: Record<string, any>) {
    return this.tokenRepo.findOne({
      where: query,
    });
  }

  async deleteUserTokens(userId: number) {
    await this.tokenRepo.delete({
      user: {
        id: userId,
      },
    });
  }
}
