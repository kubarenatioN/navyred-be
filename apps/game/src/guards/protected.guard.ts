import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SESSION_KEY } from '../constants';

@Injectable()
/**
 * Protects route from access if request not contain cookie with session ID
 */
export class ProtectedGuard implements CanActivate {
  constructor(@Inject(SESSION_KEY) private sessionToken: string) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    // const session = req.cookies[this.sessionToken];

    const session = req.headers.authorization;

    if (!session) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
