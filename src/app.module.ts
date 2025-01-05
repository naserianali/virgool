import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as process from "node:process";
import { join } from "path";
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from './config/typeorm.config';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), ".env"),
    }),
    TypeOrmModule.forRoot(TypeormConfig()),
    UserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
