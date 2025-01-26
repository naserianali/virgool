import {Inject, Injectable, NotFoundException, Scope} from '@nestjs/common';
import {CreateImageDto} from './dto/create-image.dto';
import {UpdateImageDto} from './dto/update-image.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {ImageEntity} from "./entities/image.entity";
import {Repository} from "typeorm";
import {MulterFile} from "../../common/untils/multer.utils";
import {Request} from "express";
import {REQUEST} from "@nestjs/core";
import {NotFoundMessage, PublicMessage} from "../../common/enums/messages.enum";
import {join} from "path";
import {existsSync, unlinkSync} from "fs";

@Injectable({scope: Scope.REQUEST})
export class ImageService {
    constructor(
        @InjectRepository(ImageEntity) private imageRepository: Repository<ImageEntity>,
        @Inject(REQUEST) private request: Request
    ) {
    }

    async create(createImageDto: CreateImageDto, image: MulterFile) {
        const {id} = this.request.user
        const {alt, name} = createImageDto
        let location = image?.path?.slice(7)
        await this.imageRepository.insert({
            alt: alt || name,
            name,
            location,
            userId: id
        })
        return {
            message: PublicMessage.Created
        }
    }

    findAll() {
        const {id: userId} = this.request.user;
        return this.imageRepository.find({
            where: {userId},
            order: {createdAt: "DESC"}
        })
    }

    async findOne(id: string) {
        const {id: userId} = this.request.user;
        const image = await this.imageRepository.findOne({
            where: {userId, id},
            order: {createdAt: "DESC"}
        })
        if (!image)
            throw new NotFoundException(NotFoundMessage.NotFound)
        return image;
    }

    async update(id: string, updateImageDto: UpdateImageDto, image: MulterFile) {
        const {name, alt} = updateImageDto
        const existImage = await this.findOne(id);
        if (name) existImage.name = name;
        if (alt) existImage.alt = alt;
        if (image) {
            if (existImage.location.length > 0) {
                let dirname = join("public", existImage.location);
                if (existsSync(dirname)) unlinkSync(dirname);
            }
            existImage.location = image.path.slice(7)
        }
        await this.imageRepository.save(existImage);
        return {
            message: PublicMessage.Updated
        }
    }

    async remove(id: string) {
        const image = await this.findOne(id);
        if (image?.location?.length > 0) {
            let dirname = join("public", image.location);
            if (existsSync(dirname)) unlinkSync(dirname);
        }
        await this.imageRepository.remove(image)
        return {
            message: PublicMessage.Deleted
        }
    }
}
