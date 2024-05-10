import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SESSION_KEY } from '../constants';
import { AuthService } from '../modules/auth/service';

@Injectable()
/**
 * Try to get user by session ID and attach result to req.user
 */
export class GetUserGuard implements CanActivate {
  constructor(
    @Inject(SESSION_KEY) private sessionToken: string,
    private authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    // const session = req.cookies[this.sessionToken];
    const sessionToken = req.headers.authorization;

    if (!sessionToken) {
      throw new UnauthorizedException();
    }

    const user = await this.authService.getUserBySession(sessionToken);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    req.user = user;

    return true;
  }
}
