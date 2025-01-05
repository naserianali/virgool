import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as process from "node:process";

export function TypeormConfig(): TypeOrmModuleOptions {
  const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME } = process.env;
  return {
    type: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    synchronize: true,
    entities: ["dist/**/*.entity{.ts,.js}"],
  };
}
