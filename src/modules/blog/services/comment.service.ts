import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "../entities/blog.entity";
import { Repository } from "typeorm";
import { BlogCommentEntity } from "../entities/blog-commnets.entity";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { BlogService } from "./blog.service";
import { BlogCommentDto } from "../dto/create-blog.dto";

@Injectable({ scope: Scope.REQUEST })
export class BlogCommentService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCommentEntity)
    private commentRepository: Repository<BlogCommentEntity>,
    @Inject(REQUEST) private request: Request,
    private blogService: BlogService,
  ) {}

  async createComment(commentDto: BlogCommentDto) {
    const { id: userId } = this.request.user;
    const { text, parentId, blogId } = commentDto;
    const blog = await this.blogService.findBlogById(blogId);
    if (!blog) throw new NotFoundException("Blog not found");
    let parent = null;
    if (parentId) {
      parent = await this.commentRepository.findOneBy({ id: parentId });
    }
    await this.commentRepository.insert({
      blogId,
      text,
      parentId: parent ? parentId : null,
      userId,
    });
    return {
      message: "comment created successfully",
    };
  }
}
