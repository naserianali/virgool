import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export function SwaggerConfigInit(app: INestApplication) {
  const document = new DocumentBuilder()
    .setTitle("Swagger Config")
    .setDescription("clone of virgool")
    .setVersion("1.0")
    .addBearerAuth(SwaggerAuthConfigInit() , 'Authentication')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, document);
  SwaggerModule.setup("/docs", app, swaggerDocument);
}

function SwaggerAuthConfigInit(): SecuritySchemeObject {
  return {
    type: "http",
    bearerFormat: "jwt",
    in: "header",
    scheme: "bearer",
  };
}
