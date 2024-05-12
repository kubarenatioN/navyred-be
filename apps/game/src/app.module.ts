import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { mainCon } from './db/providers';
import {
  Raid,
  RefreshToken,
  Unit,
  UnitModel,
  UnitUpgrade,
  User,
  UserAccount,
  UserSession,
} from './entities';
import { AuthModule } from './modules/auth/auth.module';
import { RaidModule } from './modules/raid/raid.module';
import { SharedModule } from './modules/shared/shared.module';
import { UnitsModule } from './modules/units/units.module';

const gameStaticAssetsPath = join(__dirname, '../../assets');

@Module({
  imports: [
    UnitsModule,
    RaidModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          ...mainCon(configService),
          entities: [
            UnitModel,
            Raid,
            User,
            UserAccount,
            UserSession,
            Unit,
            UnitUpgrade,
            RefreshToken,
          ],
        };
      },
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: gameStaticAssetsPath,
      serveRoot: '/assets/game',
      serveStaticOptions: {
        index: false,
      },
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env.game', '.env.web3'],
    }),
    ScheduleModule.forRoot(),
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
