import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "../entities/blog.entity";
import { Repository } from "typeorm";
import { BlogCommentEntity } from "../entities/blog-commnets.entity";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { BlogService } from "./blog.service";
import { BlogCommentDto } from "../dto/create-blog.dto";
import { PaginationDto } from "../../../common/dto/pagination.dto";
import {
  Pagination,
  PaginationGenerator,
} from "../../../common/untils/pagination";

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

  async commentList(paginationDto: PaginationDto) {
    const { page, perPage, skip } = Pagination(paginationDto);
    const [comments, count] = await this.commentRepository.findAndCount({
      where: {},
      skip,
      take: perPage,
      relations: {
        blog: true,
        user: {
          profile: true,
        },
      },
      select: {
        blog: {
          title: true,
        },
        user: {
          username: true,
          profile: {
            nickname: true,
          },
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
    return {
      pagination: PaginationGenerator(count, page, perPage),
      comments,
    };
  }

  async findCommentById(id: string) {
    return await this.commentRepository.findOneBy({ id });
  }

  async commentStatus(id: string) {
    const comment = await this.findCommentById(id);
    if (!comment) throw new NotFoundException("Comment not found");
    comment.accepted = !comment.accepted;
    await this.commentRepository.save(comment);
    return {
      message: "comment status Updated",
    };
  }
}
