import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { catchTokenError, verifyAccess } from '../helpers/auth';
import { TokenService } from '../modules/auth/service';
import { UserService } from '../modules/user/services';

@Injectable()
/**
 * Try to get user by token ID and attach result to req.user
 */
export class GetUserGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const value = req.headers.authorization;

    if (!value) {
      throw new UnauthorizedException();
    }

    const accessToken = value.split(' ')[1];

    let userId: number;
    let refreshId: number;

    await catchTokenError(async () => {
      const { refreshId: _refreshId, userId: _userId } =
        verifyAccess(accessToken);

      userId = _userId;
      refreshId = _refreshId;
    });

    const refresh = await this.tokenService.findOne({
      id: refreshId,
    });

    /**
     * Throw 401 error if:
     * - no refresh token associated with current access token
     * - refresh token already used
     */
    if (!refresh || refresh.used) {
      await this.tokenService.deleteUserTokens(userId);

      throw new UnauthorizedException();
    }

    if (!userId) {
      throw new BadRequestException();
    }

    const user = await this.userService.getUser({
      id: userId,
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    req.user = user;

    return true;
  }
}
