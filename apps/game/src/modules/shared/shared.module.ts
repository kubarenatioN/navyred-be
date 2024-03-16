import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UnitsModule } from '../units/units.module';

@Global()
@Module({
  imports: [AuthModule, UnitsModule],
  exports: [AuthModule, UnitsModule],
})
export class SharedModule {}
