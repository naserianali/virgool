import {Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query,} from "@nestjs/common";
import {BlogService} from "../services/blog.service";
import {BlogFilterDto, CreateBlogDto} from "../dto/create-blog.dto";
import {UpdateBlogDto} from "../dto/update-blog.dto";
import {Pagination} from "../../../common/decorators/pagination.decorator";
import {SkipAuth} from "../../../common/decorators/skip-auth.decorator";
import {PaginationDto} from "../../../common/dto/pagination.dto";
import {AuthDecorator} from "../../../common/decorators/auth.decorator";

@Controller("blog")
@AuthDecorator()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @Get()
  @Pagination()
  @SkipAuth()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filter: BlogFilterDto,
  ) {
    return this.blogService.findAll(paginationDto, filter);
  }

  @Get("/my")
  @Pagination()
  getMyBlogs(@Query() paginationDto: PaginationDto) {
    return this.blogService.getMyBlogs(paginationDto);
  }

  @Get("/my/bookmarks")
  myBookmarks() {
    return this.blogService.myBookmarks();
  }

  @Get("/:slug")
  @SkipAuth()
  @Pagination()
  getOneBySlug(
    @Param("slug") slug: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.blogService.finOneBySlug(slug , paginationDto);
  }

  @Put(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Put("/like/:id")
  like(@Param("id", ParseUUIDPipe) id: string) {
    return this.blogService.like(id);
  }

  @Put("/bookmark/:id")
  bookmark(@Param("id", ParseUUIDPipe) id: string) {
    return this.blogService.bookmark(id);
  }

  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.blogService.remove(id);
  }
}
