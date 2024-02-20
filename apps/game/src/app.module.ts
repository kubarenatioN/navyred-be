import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { mainCon } from './db/providers';
import { Raid, Unit, User, UserAccount } from './entities';
import { RaidModule } from './modules/raid/raid.module';
import { UnitsModule } from './modules/units/units.module';

const gameStaticAssetsPath = join(__dirname, '../../assets');

@Module({
  imports: [
    UnitsModule,
    RaidModule,
    TypeOrmModule.forRoot({
      ...mainCon,
      entities: [Unit, Raid, User, UserAccount],
    }),
    ServeStaticModule.forRoot({
      rootPath: gameStaticAssetsPath,
      serveRoot: '/assets/game',
      serveStaticOptions: {
        index: false,
      },
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env.game'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
