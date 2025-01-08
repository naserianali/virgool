import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { MulterStorage } from "../untils/multer.utils";

export function UploadedOptionalFiles() {
  return applyDecorators(

  );
}
