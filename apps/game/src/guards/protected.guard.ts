import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
/**
 * Protects route from access if request not contain cookie with session ID
 */
export class ProtectedGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    // const session = req.cookies[this.sessionToken];

    const accessToken = req.headers.authorization;

    if (!accessToken) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
