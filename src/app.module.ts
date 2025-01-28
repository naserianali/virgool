import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import * as process from "node:process";
import {join} from "path";
import {TypeOrmModule} from '@nestjs/typeorm';
import {TypeormConfig} from './config/typeorm.config';
import {UserModule} from './modules/user/user.module';
import {AuthModule} from './modules/auth/auth.module';
import {CategoryModule} from './modules/category/category.module';
import {BlogModule} from './modules/blog/blog.module';
import {ImageModule} from './modules/image/image.module';
import {CustomHttpModule} from "./modules/http/http.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), ".env"),
    }),
    TypeOrmModule.forRoot(TypeormConfig()),
    UserModule,
    AuthModule,
    CategoryModule,
    BlogModule,
    ImageModule,
    CustomHttpModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
}
