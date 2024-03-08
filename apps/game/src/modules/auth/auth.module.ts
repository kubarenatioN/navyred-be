import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SESSION_KEY } from '../../constants';
import {
  Raid,
  Unit,
  UnitModel,
  User,
  UserAccount,
  UserSession,
} from '../../entities';
import { RaidService } from '../raid/services';
import { UnitsService } from '../units/services';
import { UnitsModule } from '../units/units.module';
import { UserService } from '../user/services';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers';
import { AuthService } from './service';
import { TaskService } from './service/task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSession,
      UserAccount,
      Unit,
      UnitModel,
      Raid,
    ]),
    UserModule,
    UnitsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    UnitsService,
    RaidService,
    TaskService,
    {
      provide: SESSION_KEY,
      useFactory: () => {
        return process.env.SESSION_KEY;
      },
    },
  ],
  exports: [AuthService, SESSION_KEY],
})
export class AuthModule {}
