import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { LoginUserDTO, RegisterUserDTO } from 'apps/game/src/dto';
import { minutesToMilliseconds } from 'date-fns';
import { Request, Response } from 'express';
import { AuthService } from '../service';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('self')
  async getSession(@Req() req: Request) {
    const session = req.cookies['session'];

    return this.authService.getSession(session);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() body: LoginUserDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, session } = await this.authService.login(body);
    res.cookie('session', session, {
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
    res.cookie('session', session, {
      maxAge: minutesToMilliseconds(15),
      secure: true,
    });

    return user;
  }
}
