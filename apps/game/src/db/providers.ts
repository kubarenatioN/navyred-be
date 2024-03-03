import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Returns the config for main database connection
 *
 * @param configService configuration service
 */
export function mainCon(configService: ConfigService): TypeOrmModuleOptions {
  const PG_HOST = configService.get('PG_HOST');
  const PG_DB = configService.get('PG_DB');
  const PG_USERNAME = configService.get('PG_USERNAME');
  const PG_PASSWORD = configService.get('PG_PASSWORD');

  return {
    type: 'postgres',
    host: PG_HOST,
    port: 5432,
    database: PG_DB,
    username: PG_USERNAME,
    password: PG_PASSWORD,
    synchronize: true,
    ssl: true,
  };
}

// TODO: Change naming
export const secondaryCon: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'root',
  entities: [],
  synchronize: true,
};
