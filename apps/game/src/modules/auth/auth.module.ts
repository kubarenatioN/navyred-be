import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SESSION_KEY } from '../../constants';
import { User, UserSession } from '../../entities';
import { AuthController } from './controllers';
import { AuthService } from './service';
import { TaskService } from './service/task.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession])],
  controllers: [AuthController],
  providers: [
    AuthService,
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
