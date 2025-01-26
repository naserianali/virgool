import {Request} from 'express';
import {mkdirSync} from 'fs';
import {join, extname} from 'path';
import {BadRequestException} from '@nestjs/common';
import {diskStorage, StorageEngine} from 'multer';
import * as crypto from "node:crypto";

export type CallbackDestinationFunction = (
    error: Error,
    destination: string,
) => void;
export type CallbackFilenameFunction = (
    error: Error,
    destination: string,
) => void;
export type MulterFile = Express.Multer.File;

export function MulterDestination(fileName: string) {
    return (
        req: Request,
        file: MulterFile,
        callback: CallbackDestinationFunction,
    ) => {
        let path = join('public', 'uploads', fileName);
        mkdirSync(path, {recursive: true});
        callback(null, path);
    };
}

export function MulterFilename(
    req: Request,
    file: MulterFile,
    callback: CallbackFilenameFunction,
) {
    const ext = extname(file.originalname);
    if (!isValidFormat(ext))
        callback(new BadRequestException('file format is not acceptable '), null);
    const filename = `${Date.now()}${crypto.randomUUID()}${ext}`;
    callback(null, filename);
}

function isValidFormat(ext: string): boolean {
    return ['.jpeg', '.jpg', '.png'].includes(ext.toLowerCase());
}

export function MulterStorage(folderName: string): StorageEngine {
    return diskStorage({
        destination: MulterDestination(folderName),
        filename: MulterFilename,
    })
}
