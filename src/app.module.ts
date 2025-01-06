import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as process from "node:process";
import { join } from "path";
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from './config/typeorm.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), ".env"),
    }),
    TypeOrmModule.forRoot(TypeormConfig()),
    UserModule,
    AuthModule,
    CategoryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
