import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../../auth/guards/auth/auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { BlogCommentService } from "../services/comment.service";
import { BlogCommentDto } from "../dto/create-blog.dto";
import { Pagination } from "../../../common/decorators/pagination.decorator";
import { PaginationDto } from "../../../common/dto/pagination.dto";

@Controller("blog-comment")
@UseGuards(AuthGuard)
@ApiBearerAuth("Authentication")
export class BlogCommentController {
  constructor(private readonly commentService: BlogCommentService) {}

  @Get("/")
  @Pagination()
  commentList(@Query() paginationDto: PaginationDto) {
    return this.commentService.commentList(paginationDto);
  }

  @Post("/")
  createComment(@Body() blogCommentDto: BlogCommentDto) {
    return this.commentService.createComment(blogCommentDto);
  }

  @Patch("/status/:id")
  commentStatus(@Param("id", ParseUUIDPipe) id: string) {
    return this.commentService.commentStatus(id);
  }
}
