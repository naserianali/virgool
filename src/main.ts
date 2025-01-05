import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerConfigInit } from "./config/swagger.config";
import * as process from "node:process";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  SwaggerConfigInit(app);
  const { PORT } = process.env;
  await app.listen(PORT , ()=>{
    console.log(`Server started on port ${PORT}`);
    console.log(`Swagger is up in http://localhost:${PORT}/docs`);
  });
}

bootstrap();
