import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function SwaggerConfigInit(app: INestApplication) {
  const document = new DocumentBuilder()
    .setTitle("Swagger Config")
    .setDescription("clone of virgool")
    .setVersion("1.0")
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, document);
  SwaggerModule.setup("/docs", app, swaggerDocument);
}
