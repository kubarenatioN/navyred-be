import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserSession } from '../../entities';
import { AuthController } from './controllers';
import { AuthService } from './service';
import { TaskService } from './service/task.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession])],
  controllers: [AuthController],
  providers: [AuthService, TaskService],
})
export class AuthModule {}
