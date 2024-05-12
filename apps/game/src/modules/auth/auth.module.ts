import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SESSION_KEY } from '../../constants';
import {
  Raid,
  RefreshToken,
  Unit,
  User,
  UserAccount,
  UserSession,
} from '../../entities';
import { RaidService } from '../raid/services';
import { UserModule } from '../user/user.module';
import {
  AuthController,
  TokenController,
  Web3AuthController,
} from './controllers';
import { AuthService, TokenService, Web3AuthService } from './service';
import { TaskService } from './service/task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSession,
      Unit,
      UserAccount,
      Raid,
      RefreshToken,
    ]),
    UserModule,
  ],
  controllers: [AuthController, Web3AuthController, TokenController],
  providers: [
    AuthService,
    Web3AuthService,
    TokenService,
    RaidService,
    TaskService,
    {
      provide: SESSION_KEY,
      useFactory: () => {
        return process.env.SESSION_KEY;
      },
    },
  ],
  exports: [AuthService, TokenService, SESSION_KEY],
})
export class AuthModule {}
