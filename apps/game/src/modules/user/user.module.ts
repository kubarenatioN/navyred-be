import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserAccount, UserSession } from '../../entities';
import { UserService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession, UserAccount])],
  providers: [UserService],
})
export class UserModule {}
