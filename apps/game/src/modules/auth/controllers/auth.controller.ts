import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { SESSION_KEY } from 'apps/game/src/constants';
import { LoginUserDTO, RegisterUserDTO } from 'apps/game/src/dto';
import { minutesToMilliseconds } from 'date-fns';
import { Request, Response } from 'express';
import { decode } from 'jsonwebtoken';
import { AccessTokenPayload } from '../models';
import { AuthService } from '../service';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(SESSION_KEY) private sessionToken: string,
  ) {}

  @Get('self')
  async getUserBySession(@Req() req: Request) {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new UnauthorizedException();
    }

    const token = authorization.split(' ')[1];

    return this.authService.getUserByToken(token);
  }

  @HttpCode(HttpStatus.OK)
  // @UseGuards(LocalAuthGuard) // decided to go with own implementation
  @Post('login')
  async login(@Body() body: LoginUserDTO) {
    const { user, session } = await this.authService.login(body);

    // this.setSessionInCookie(res, session);

    return {
      user,
      session,
    };
  }

  @Post('register')
  async register(@Body() body: RegisterUserDTO) {
    const { login, password } = body;
    const { user, session } = await this.authService.register({
      login,
      password,
    });

    return {
      user,
      session,
    };
  }

  @Get('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request) {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new UnauthorizedException();
    }

    const { userId } = decode(
      authorization.split(' ')[1],
    ) as AccessTokenPayload;

    await this.authService.logout(userId);
  }

  private setSessionInHeader(res: Response, session: string) {
    res.setHeader('X-Session', session);
    res.setHeader('X-Session-Rotation', 'todo:rotation_token_here');
  }

  private setSessionInCookie(res: Response, session: string) {
    const domain = process.env['CLIENT_DOMAIN'] ?? 'localhost';

    res.cookie(this.sessionToken, session, {
      maxAge: minutesToMilliseconds(15),
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      domain,
    });
  }
}
