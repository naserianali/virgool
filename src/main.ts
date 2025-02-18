import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {SwaggerConfigInit} from "./config/swagger.config";
import * as process from "node:process";
import {ValidationPipe} from "@nestjs/common";
import * as CookieParser from "cookie-parser";
import {NestExpressApplication} from "@nestjs/platform-express";
import {join} from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  SwaggerConfigInit(app);
  const {PORT, HOST , HOST_PREFIX , COOKIE_SECRET} = process.env;
  app.useGlobalPipes(new ValidationPipe());
  app.use(CookieParser(COOKIE_SECRET));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.enableCors({
    origin: "http://localhost:3000",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  await app.listen(PORT, HOST, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Swagger is up in ${HOST_PREFIX}${HOST}:${PORT}/docs`);
    console.log(HOST);
  });
}

bootstrap();
