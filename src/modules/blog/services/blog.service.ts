import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import {
  BlogCommentDto,
  BlogFilterDto,
  CreateBlogDto,
} from "../dto/create-blog.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "../entities/blog.entity";
import { Repository } from "typeorm";
import { createSlug, randomId } from "../../../common/untils/functions";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { PaginationDto } from "../../../common/dto/pagination.dto";
import {
  Pagination,
  PaginationGenerator,
} from "../../../common/untils/pagination";
import { isArray } from "class-validator";
import { CategoryService } from "../../category/category.service";
import { BlogCategoryEntity } from "../entities/blog-category.entity";
import { EntityEnum } from "../../../common/enums/entity.enum";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import { BlogLikeEntity } from "../entities/blog-like.entity";
import { BlogBookmarkEntity } from "../entities/blog-bookmark.entity";

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCategoryEntity)
    private blogCategoryRepository: Repository<BlogCategoryEntity>,
    @InjectRepository(BlogLikeEntity)
    private blogLikeRepository: Repository<BlogLikeEntity>,
    @InjectRepository(BlogBookmarkEntity)
    private blogBookmarkRepository: Repository<BlogBookmarkEntity>,
    @Inject(REQUEST) private request: Request,
    private categoryService: CategoryService,
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    let { title, slug, content, description, studyTime, image, categories } =
      createBlogDto;
    if (!isArray(categories)) {
      throw new BadRequestException("Categories must be an array");
    }
    const user = this.request.user;
    slug = createSlug(slug ?? title);
    const isExists = await this.findBlogBySlug(slug);
    if (!!isExists) slug += `-${randomId()}`;
    let blog = this.blogRepository.create({
      title,
      slug,
      content,
      description,
      studyTime,
      image,
      authorId: user.id,
    });
    blog = await this.blogRepository.save(blog);
    for (const categoryTitle of categories) {
      let category = await this.categoryService.findOneByTitle(categoryTitle);
      if (!category)
        category = await this.categoryService.insetByTitle(categoryTitle);
      await this.blogCategoryRepository.insert({
        blogId: blog.id,
        categoryId: category.id,
      });
    }
    return {
      message: "Blog created successfully.",
    };
  }

  async getMyBlogs() {
    const user = this.request.user;
    return await this.blogRepository.find({
      where: {
        authorId: user.id,
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  async findAll(paginationDto: PaginationDto, filter: BlogFilterDto) {
    let { search, category } = filter;
    let where: string = "";
    if (category) {
      category = category.toLowerCase();
      if (where.length > 0) where += " AND ";
      where += "category.title = LOWER(:category)";
    }
    if (search) {
      if (where.length > 0) where += " AND ";
      search = `%${search}%`;
      where +=
        "CONCAT(blogs.title , blogs.content , blogs.description) ILIKE :search";
    }
    const { perPage, page, skip } = Pagination(paginationDto);
    const [blogs, count] = await this.blogRepository
      .createQueryBuilder(EntityEnum.Blog)
      .leftJoin("blogs.categories", "categories")
      .leftJoin("categories.category", "category")
      .leftJoin("blogs.author", "author")
      .leftJoin("author.profile", "profile")
      .loadRelationCountAndMap("blogs.likes", "blogs.likes")
      .loadRelationCountAndMap(
        "blogs.comments",
        "blogs.comments",
        "comments",
        (qb) => qb.where("comments.accepted = :accepted", { accepted: true }),
      )
      .where(where, { category, search })
      .addSelect([
        "category.title",
        "categories.id",
        "author.id",
        "profile.nickname",
      ])
      .skip(skip)
      .take(perPage)
      .orderBy("blogs.createdAt", "DESC")
      .getManyAndCount();
    return {
      pagination: PaginationGenerator(count, page, perPage),
      blogs,
    };
  }

  async findOneById(id: string) {
    return await this.blogRepository.findOneBy({ id });
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    let { content, description, studyTime, image, categories, title, slug } =
      updateBlogDto;
    const blog = await this.findOneById(id);
    if (!blog) throw new NotFoundException("blog not found");
    if (blog.id !== id && slug === blog.slug)
      slug = createSlug(slug ?? title) + `-${randomId()}`;
    if (blog.id === id && slug !== blog.slug)
      blog.slug = createSlug(slug ?? title);
    if (title) blog.title = title;
    if (categories && categories.length > 0) {
      await this.blogCategoryRepository.delete({
        blogId: blog.id,
      });
      for (const categoryTitle of categories) {
        let category = await this.categoryService.findOneByTitle(categoryTitle);
        if (!category)
          category = await this.categoryService.insetByTitle(categoryTitle);
        await this.blogCategoryRepository.insert({
          blogId: blog.id,
          categoryId: category.id,
        });
      }
    }
    if (content) blog.content = content;
    if (description) blog.description = description;
    if (studyTime) blog.studyTime = studyTime;
    if (image) {
      if (blog?.image?.length > 0) {
        let dirname = join("public", blog.image);
        if (existsSync(dirname)) unlinkSync(dirname);
      }
      blog.image = image;
    }
    await this.blogRepository.save(blog);
    return {
      message: "Blog Updated Successfully",
    };
  }

  async remove(id: string) {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) throw new BadRequestException("Blog does not exist");
    await this.blogRepository.remove(blog);
    return {
      message: "Blog removed successfully.",
    };
  }

  async findBlogBySlug(slug: string) {
    return await this.blogRepository.findOneBy({ slug });
  }

  async findBlogById(id: string) {
    return await this.blogRepository.findOneBy({ id });
  }

  async like(id: string) {
    const { id: userId } = this.request.user;
    const blog = await this.findBlogById(id);
    if (!blog) throw new NotFoundException("Blog not found");
    const isLiked = await this.blogLikeRepository.findOneBy({
      userId,
      blogId: blog.id,
    });
    if (isLiked) {
      await this.blogLikeRepository.remove(isLiked);
      return {
        message: "Blog like removed successfully.",
      };
    } else {
      await this.blogLikeRepository.insert({
        blogId: blog.id,
        userId,
      });
      return {
        message: "Blog liked successfully",
      };
    }
  }

  async bookmark(id: string) {
    const { id: userId } = this.request.user;
    const blog = await this.findBlogById(id);
    if (!blog) throw new NotFoundException("Blog not found");
    const isBookmarked = await this.blogBookmarkRepository.findOneBy({
      userId,
      blogId: blog.id,
    });
    if (isBookmarked) {
      await this.blogBookmarkRepository.remove(isBookmarked);
      return {
        message: "Blog bookmark removed successfully.",
      };
    } else {
      await this.blogBookmarkRepository.insert({
        blogId: blog.id,
        userId,
      });
      return {
        message: "Blog bookmarked successfully.",
      };
    }
  }

  async myBookmarks() {
    const { id } = this.request.user;
    return await this.blogRepository.find({
      where: {
        bookmarks: {
          userId: id,
        },
      },
    });
  }
}
