import {Injectable} from '@nestjs/common';
import {CreateImageDto} from './dto/create-image.dto';
import {UpdateImageDto} from './dto/update-image.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {ImageEntity} from "./entities/image.entity";
import {Repository} from "typeorm";
import {MulterFile} from "../../common/untils/multer.utils";

@Injectable()
export class ImageService {
    constructor(@InjectRepository(ImageEntity) private imageRepository: Repository<ImageEntity>) {
    }

    create(createImageDto: CreateImageDto, image: MulterFile) {
        return 'This action adds a new image';
    }

    findAll() {
        return `This action returns all image`;
    }

    findOne(id: number) {
        return `This action returns a #${id} image`;
    }

    update(id: number, updateImageDto: UpdateImageDto) {
        return `This action updates a #${id} image`;
    }

    remove(id: number) {
        return `This action removes a #${id} image`;
    }
}
