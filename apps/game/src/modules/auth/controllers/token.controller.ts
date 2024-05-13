import {
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  accessTokenLifespan,
  refreshTokenLifespan,
} from 'apps/game/src/constants';
import { RefreshToken } from 'apps/game/src/entities';
import {
  signAccess,
  signRefresh,
  verifyRefresh,
} from 'apps/game/src/helpers/auth';
import { add } from 'date-fns';
import { decode } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { AccessTokenPayload } from '../models';
import { TokenService } from '../service';

@Controller({
  path: 'token',
  version: '1',
})
export class TokenController {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshRepo: Repository<RefreshToken>,
    private tokenService: TokenService,
  ) {}

  @Get('refresh')
  async refresh(@Headers('authorization') auth: string) {
    const accessToken = auth.split(' ')[1];
    const {
      userId,
      address,
      refreshId: oldRefreshId,
    } = decode(accessToken) as AccessTokenPayload;

    const userTokens = await this.refreshRepo.find({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (userTokens.length === 0) {
      throw new HttpException(
        'Try to log in first',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newRefresh = signRefresh({
      payload: {
        userId,
      },
      expiresIn: refreshTokenLifespan,
    });

    let newRefreshTokenId;
    const unusedTokens = userTokens.filter((t) => !t.used);
    if (unusedTokens.length === 0) {
      throw new HttpException(
        'Try to log in first',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    } else if (unusedTokens.length === 1) {
      const usedToken = unusedTokens[0];

      /**
       * Check if user id from access token match with refresh token
       */
      const { userId: oldRefreshTokenUserId } = verifyRefresh(usedToken.token);
      if (oldRefreshTokenUserId !== userId) {
        await this.tokenService.deleteUserTokens(userId);
        throw new UnauthorizedException();
      }

      if (usedToken.id !== oldRefreshId) {
        await this.tokenService.deleteUserTokens(userId);
        throw new UnprocessableEntityException();
      }

      usedToken.used = true;
      const [, { id }] = await this.refreshRepo.save([
        usedToken,
        {
          token: newRefresh,
          user: { id: userId },
          used: false,
          expiresIn: add(new Date(), {
            days: 5,
          }),
        },
      ]);
      newRefreshTokenId = id;
    } else {
      await this.tokenService.deleteUserTokens(userId);
      throw new UnauthorizedException();
    }

    const newAccess = signAccess({
      payload: {
        userId,
        address,
        refreshId: newRefreshTokenId,
      },
      expiresIn: accessTokenLifespan,
    });

    return { accessToken: newAccess };
  }
}
