import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const mainCon: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'test-db',
  username: 'postgres',
  password: 'root',
  synchronize: true,
};

// TODO: Change naming
export const secondaryCon: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'root',
  entities: [],
  synchronize: true,
};
