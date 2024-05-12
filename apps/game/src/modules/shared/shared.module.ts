import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UnitsModule } from '../units/units.module';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [AuthModule, UnitsModule, UserModule],
  exports: [AuthModule, UnitsModule, UserModule],
})
export class SharedModule {}
