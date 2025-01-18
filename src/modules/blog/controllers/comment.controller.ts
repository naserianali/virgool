import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../auth/guards/auth/auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { BlogCommentService } from "../services/comment.service";
import { BlogCommentDto } from "../dto/create-blog.dto";

@Controller("blog-comment")
@UseGuards(AuthGuard)
@ApiBearerAuth("Authentication")
export class BlogCommentController {
  constructor(private readonly commentService: BlogCommentService) {}

  @Post('/')
  createComment(@Body() blogCommentDto: BlogCommentDto) {
    return this.commentService.createComment(blogCommentDto);
  }
}
