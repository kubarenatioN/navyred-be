import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
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
  async getSession(@Req() req: Request) {
    const session = req.cookies[this.sessionToken];

    return this.authService.getSession(session);
  }

  @HttpCode(HttpStatus.OK)
  // @UseGuards(LocalAuthGuard) // decided to go with own implementation
  @Post('login')
  async login(
    @Body() body: LoginUserDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, session } = await this.authService.login(body);
    res.cookie(this.sessionToken, session, {
      maxAge: minutesToMilliseconds(15),
      secure: true,
    });

    return user;
  }

  @Post('register')
  async register(
    @Body() body: RegisterUserDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { login, password } = body;
    const { user, session } = await this.authService.register({
      login,
      password,
    });
    res.cookie(this.sessionToken, session, {
      maxAge: minutesToMilliseconds(15),
      secure: true,
    });

    return user;
  }
}
