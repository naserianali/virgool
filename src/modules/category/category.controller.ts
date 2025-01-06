import {Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe} from '@nestjs/common';
import {CategoryService} from './category.service';
import {CreateCategoryDto} from './dto/create-category.dto';
import {UpdateCategoryDto} from './dto/update-category.dto';
import {ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags} from "@nestjs/swagger";
import {SwaggerConsumerEnum} from "../auth/enums/swagger.consumer.enum";
import {PaginationDto} from "../../common/dto/pagination.dto";
import {Pagination} from "../../common/decorators/pagination.decrator";

@Controller('category')
@ApiTags('Category')
@ApiBearerAuth('Authentication')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {
    }

    @Post()
    @ApiConsumes(SwaggerConsumerEnum.UrlEncode, SwaggerConsumerEnum.Json)
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }

    @Get()
    @Pagination()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.categoryService.findAll(paginationDto);
    }

    @Get(':id')
    findOne(@Param('id' , ParseUUIDPipe) id: string) {
        return this.categoryService.findOne(id);
    }

    @Patch(':id')
    @ApiConsumes(SwaggerConsumerEnum.UrlEncode, SwaggerConsumerEnum.Json)
    update(@Param('id' , ParseUUIDPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoryService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    remove(@Param('id' , ParseUUIDPipe) id: string) {
        return this.categoryService.remove(id);
    }
}
