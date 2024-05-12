import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import {
  JsonWebTokenError,
  SignOptions,
  TokenExpiredError,
  sign,
  verify,
} from 'jsonwebtoken';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../../modules/auth/models';

export function signAccess(data: {
  payload: AccessTokenPayload;
  expiresIn?: SignOptions['expiresIn'];
}): string {
  const { payload, expiresIn } = data;
  const secret = process.env.ACCESS_TOKEN_SECRET;

  const options: SignOptions = {};
  if (expiresIn) {
    options.expiresIn = expiresIn;
  }

  return sign(payload, secret, options);
}

export function verifyAccess(token: string) {
  return verify(token, process.env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
}

export function signRefresh(data: {
  payload: RefreshTokenPayload;
  expiresIn?: SignOptions['expiresIn'];
}): string {
  const { payload, expiresIn } = data;
  const secret = process.env.REFRESH_TOKEN_SECRET;

  const options: SignOptions = {};
  if (expiresIn) {
    options.expiresIn = expiresIn;
  }

  return sign(payload, secret, options);
}

export function verifyRefresh(token: string) {
  return verify(token, process.env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
}

export async function catchTokenError(fn: CallableFunction) {
  try {
    return await fn();
  } catch (error) {
    // console.error(error.message); // dev

    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedException();
    }

    if (error instanceof JsonWebTokenError) {
      throw new BadRequestException();
    }
  }
}
