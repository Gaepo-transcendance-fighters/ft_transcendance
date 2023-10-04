import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';
// import * as dotenv from 'dotenv';
// dotenv.config();
// const dbConfig = config.get('db');

// export const typeORMConfig: TypeOrmModuleOptions = {
//   // Database Type
//   type: process.env.DB_DATABASE || dbConfig.type,
//   host: process.env.RDS_HOSTNAME || dbConfig.host,
//   port: process.env.RDS_PORT || dbConfig.port,
//   username: process.env.RDS_USERNAME || dbConfig.username,
//   password: process.env.RDS_PASSWORD || dbConfig.password,
//   database: process.env.RDS_DB_NAME || dbConfig.database,
//   entities: [__dirname + '/../**/*.entity.{js,ts}'],
//   synchronize: process.env.SYNC || dbConfig.synchronize,
// };

import * as dotenv from 'dotenv';
dotenv.config();
const port = Number(process.env.RDS_PORT);
const sync = process.env.SYNC ? true : false;
export const typeORMConfig: TypeOrmModuleOptions = {
  // Database Type
  type: 'postgres' ,
  host: process.env.RDS_HOSTNAME ,
  port: port ,
  username: process.env.RDS_USERNAME ,
  password: process.env.RDS_PASSWORD ,
  database: process.env.RDS_DB_NAME ,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: sync ,
};
