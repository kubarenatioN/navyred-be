import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SESSION_KEY } from '../../constants';
import { User, UserAccount, UserSession } from '../../entities';
import { UserService } from '../user/services';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers';
import { AuthService } from './service';
import { TaskService } from './service/task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession, UserAccount]),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
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
