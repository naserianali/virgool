import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseUUIDPipe, Put} from '@nestjs/common';
import {BlogService} from './blog.service';
import {BlogFilterDto, CreateBlogDto} from './dto/create-blog.dto';
import {UpdateBlogDto} from './dto/update-blog.dto';
import {AuthGuard} from "../auth/guards/auth/auth.guard";
import {ApiBearerAuth} from "@nestjs/swagger";
import {Pagination} from "../../common/decorators/pagination.decorator";
import {SkipAuth} from "../../common/decorators/skip-auth.decorator";
import {PaginationDto} from "../../common/dto/pagination.dto";
import {AuthDecorator} from "../../common/decorators/auth.decorator";

@Controller('blog')
@AuthDecorator()
export class BlogController {
    constructor(private readonly blogService: BlogService) {
    }

    @Post()
    create(@Body() createBlogDto: CreateBlogDto) {
        return this.blogService.create(createBlogDto);
    }

    @Get()
    @Pagination()
    @SkipAuth()
    findAll(@Query() paginationDto: PaginationDto, @Query() filter: BlogFilterDto) {
        return this.blogService.findAll(paginationDto, filter);
    }

    @Get('/my')
    getMyBlogs() {
        return this.blogService.getMyBlogs()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.blogService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateBlogDto: UpdateBlogDto) {
        return this.blogService.update(id, updateBlogDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.blogService.remove(id);
    }
}
