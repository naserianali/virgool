import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    UseInterceptors,
    UploadedFile
} from '@nestjs/common';
import {ImageService} from './image.service';
import {CreateImageDto} from './dto/create-image.dto';
import {UpdateImageDto} from './dto/update-image.dto';
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "../auth/guards/auth/auth.guard";
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
    findOne(@Param('id') id: string) {
        return this.imageService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
        return this.imageService.update(+id, updateImageDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.imageService.remove(+id);
    }
}
