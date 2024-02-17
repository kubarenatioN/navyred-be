import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { mainCon } from './db/providers';
import { Unit } from './entities';
import { UnitsModule } from './modules/units/units.module';

const gameStaticAssetsPath = join(__dirname, '../../assets');
console.log('dirname:', gameStaticAssetsPath);

@Module({
  imports: [
    UnitsModule,
    TypeOrmModule.forRoot({
      ...mainCon,
      entities: [Unit],
    }),
    ServeStaticModule.forRoot({
      rootPath: gameStaticAssetsPath,
      serveRoot: '/assets/game',
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
