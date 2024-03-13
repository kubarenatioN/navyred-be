import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SESSION_KEY } from '../../constants';
import { Raid, Unit, User, UserAccount, UserSession } from '../../entities';
import { RaidService } from '../raid/services';
import { UserService } from '../user/services';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers';
import { AuthService } from './service';
import { TaskService } from './service/task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession, Unit, UserAccount, Raid]),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
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
