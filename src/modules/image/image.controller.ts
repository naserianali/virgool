import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile, ParseUUIDPipe, Put
} from '@nestjs/common';
import {ImageService} from './image.service';
import {CreateImageDto} from './dto/create-image.dto';
import {UpdateImageDto} from './dto/update-image.dto';
import {ApiTags} from "@nestjs/swagger";
import {AuthDecorator} from "../../common/decorators/auth.decorator";
import {UploadInterceptor} from "../../common/interceptors/upload.interceptor";
import {MulterFile} from "../../common/untils/multer.utils";

@Controller('image')
@ApiTags('Image')
@AuthDecorator()
export class ImageController {
    constructor(private readonly imageService: ImageService) {
    }

    @Post()
    @UseInterceptors(UploadInterceptor("image", "media"))
    create(@Body() createImageDto: CreateImageDto, @UploadedFile() image: MulterFile) {
        return this.imageService.create(createImageDto, image);
    }

    @Get()
    findAll() {
        return this.imageService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.imageService.findOne(id);
    }

    @Put(':id')
    @UseInterceptors(UploadInterceptor("image", "media"))
    update(@Param('id' , ParseUUIDPipe) id: string, @Body() updateImageDto: UpdateImageDto , @UploadedFile() image: MulterFile) {
        return this.imageService.update(id, updateImageDto , image);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.imageService.remove(id);
    }
}
