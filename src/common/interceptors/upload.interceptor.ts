import {FileInterceptor} from "@nestjs/platform-express";
import {MulterStorage} from "../untils/multer.utils";

export function UploadInterceptor(filedName: string, folderName: string) {
    return class UploadUtility extends FileInterceptor(filedName, {
        storage: MulterStorage(folderName)
    }) {
    }
}