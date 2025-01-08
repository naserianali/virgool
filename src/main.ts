import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerConfigInit } from "./config/swagger.config";
import * as process from "node:process";
import { ValidationPipe } from "@nestjs/common";
import * as CookieParser from "cookie-parser";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  SwaggerConfigInit(app);
  const { PORT } = process.env;
  const { COOKE_SECRET } = process.env;
  app.useGlobalPipes(new ValidationPipe());
  app.use(CookieParser(COOKE_SECRET));
  app.useStaticAssets("public");

  await app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Swagger is up in http://localhost:${PORT}/docs`);
  });
}

bootstrap();
