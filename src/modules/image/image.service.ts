import {Inject, Injectable, NotFoundException, Scope} from '@nestjs/common';
import {CreateImageDto} from './dto/create-image.dto';
import {UpdateImageDto} from './dto/update-image.dto';
import {InjectRepository} from '@nestjs/typeorm';
import {ImageEntity} from './entities/image.entity';
import {Repository} from 'typeorm';
import {MulterFile, processImage} from '../../common/untils/multer.utils';
import {Request} from 'express';
import {REQUEST} from '@nestjs/core';
import {NotFoundMessage, PublicMessage} from '../../common/enums/messages.enum';
import {join} from 'path';
import {existsSync, unlinkSync, writeFileSync} from 'fs';

@Injectable({scope: Scope.REQUEST})
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity)
    private imageRepository: Repository<ImageEntity>,
    @Inject(REQUEST) private request: Request,
  ) {
  }

  async create(createImageDto: CreateImageDto, image: MulterFile) {
    const processedImage = await processImage(image);
    const {id: userId} = this.request.user;
    const {alt, name} = createImageDto;
    const imageName = `${Date.now()}-${image.originalname.replace(/\.[^/.]+$/, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
    }.webp`;
    const imagePath = join('public', 'uploads', 'media', imageName);
    writeFileSync(imagePath, processedImage);
    await this.imageRepository.insert({
      alt: alt || name,
      name,
      location: imagePath.slice(7),
      userId,
    });

    return {
      message: PublicMessage.Created,
    };
  }

  findAll() {
    const {id: userId} = this.request.user;
    return this.imageRepository.find({
      where: {userId},
      order: {createdAt: 'DESC'},
    });
  }

  async findOne(id: string) {
    const {id: userId} = this.request.user;
    const image = await this.imageRepository.findOne({
      where: {userId, id},
    });

    if (!image) throw new NotFoundException(NotFoundMessage.NotFound);
    return image;
  }

  async update(id: string, updateImageDto: UpdateImageDto, image: MulterFile) {
    const {name, alt} = updateImageDto;
    const existImage = await this.findOne(id);
    if (name) existImage.name = name;
    if (alt) existImage.alt = alt;
    if (image) {
      const processedImage = await processImage(image);
      const imageName = `${Date.now()}-${image.originalname.replace(/\.[^/.]+$/, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
      }--${crypto.randomUUID()}.webp`;
      const imagePath = join('public', 'uploads', 'media', imageName);
      writeFileSync(imagePath, processedImage);
      if (existImage.location.length > 0) {
        const oldImagePath = join('public', existImage.location);
        if (existsSync(oldImagePath)) unlinkSync(oldImagePath);
      }
      existImage.location = imagePath.slice(7);
    }
    await this.imageRepository.save(existImage);

    return {
      message: PublicMessage.Updated,
    };
  }

  async remove(id: string) {
    const image = await this.findOne(id);
    if (image?.location?.length > 0) {
      const imagePath = join('public', image.location);
      if (existsSync(imagePath)) unlinkSync(imagePath);
    }
    await this.imageRepository.remove(image);

    return {
      message: PublicMessage.Deleted,
    };
  }
}