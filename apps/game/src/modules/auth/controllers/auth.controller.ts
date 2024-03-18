import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { SESSION_KEY } from 'apps/game/src/constants';
import { LoginUserDTO, RegisterUserDTO } from 'apps/game/src/dto';
import { minutesToMilliseconds } from 'date-fns';
import { Request, Response } from 'express';
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
    const session = req.headers.authorization;

    return this.authService.getUserBySession(session);
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

    // this.setSessionInCookie(res, session);

    return {
      user,
      session,
    };
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
