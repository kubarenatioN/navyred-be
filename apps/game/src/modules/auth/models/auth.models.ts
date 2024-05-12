import { RefreshToken } from 'apps/game/src/entities/RefreshToken.entity';
import { UserRead } from '../../user/models';

export interface UserLogin {
  login: string;
  password: string;
}

export interface UserRegister {
  login: string;
  password: string;
}

export interface UserSessionModel {
  userId: number;
  uid: string;
  expiredAt: Date;
}

export interface Web3AuthLogin {
  user: UserRead;
  accessToken: string;
  refresh: RefreshToken;
}
