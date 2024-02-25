import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserSession } from '../../entities';
import { AuthController } from './controllers';
import { AuthService } from './service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
