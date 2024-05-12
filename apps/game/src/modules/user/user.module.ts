import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserAccount, UserSession } from '../../entities';
import { UserService } from './services';
import { UserDataService } from './services/user-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession, UserAccount])],
  providers: [UserService, UserDataService],
  exports: [UserService, UserDataService],
})
export class UserModule {}
