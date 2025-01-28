import {Request} from 'express';
import {mkdirSync, readFileSync, unlinkSync} from 'fs';
import {join, extname} from 'path';
import {BadRequestException} from '@nestjs/common';
import {diskStorage, StorageEngine} from 'multer';
import * as crypto from 'node:crypto';
import * as sharp from 'sharp'; // Import sharp

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
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  if (!validMimeTypes.includes(file.mimetype)) {
    callback(new BadRequestException('File format is not acceptable'), null);
  } else {
    const filename = `${Date.now()}${crypto.randomUUID()}.webp`; // Save as WebP
    callback(null, filename);
  }
}

function isValidFormat(ext: string): boolean {
  return ['.jpeg', '.jpg', '.png'].includes(ext.toLowerCase());
}

export function MulterStorage(folderName: string): StorageEngine {
  return diskStorage({
    destination: MulterDestination(folderName),
    filename: MulterFilename,
  });
}

export async function processImage(file: MulterFile): Promise<Buffer> {
  let buffer: Buffer;
  if (file.buffer) {
    buffer = file.buffer;
  } else if (file.path) {
    buffer = readFileSync(file.path);
    unlinkSync(file.path);
  } else {
    throw new BadRequestException('Invalid file: No buffer or path provided');
  }
  try {
    return await sharp(buffer)
      .webp({quality: 80})
      .toBuffer();
  } catch (error) {
    throw new BadRequestException('Failed to process image');
  }
}