import {
  BadRequestException,
  forwardRef,
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
import {UpdateBlogDto} from "../dto/update-blog.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {BlogEntity} from "../entities/blog.entity";
import {Repository} from "typeorm";
import {createSlug, randomId} from "../../../common/untils/functions";
import {REQUEST} from "@nestjs/core";
import {Request} from "express";
import {PaginationDto} from "../../../common/dto/pagination.dto";
import {
  Pagination,
  PaginationGenerator,
} from "../../../common/untils/pagination";
import {isArray} from "class-validator";
import {CategoryService} from "../../category/category.service";
import {BlogCategoryEntity} from "../entities/blog-category.entity";
import {EntityEnum} from "../../../common/enums/entity.enum";
import {join} from "path";
import {existsSync, unlinkSync} from "fs";
import {BlogLikeEntity} from "../entities/blog-like.entity";
import {BlogBookmarkEntity} from "../entities/blog-bookmark.entity";
import {BlogCommentService} from "./comment.service";

@Injectable({scope: Scope.REQUEST})
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
    private blogCommentService: BlogCommentService,
  ) {
  }

  async create(createBlogDto: CreateBlogDto) {
    let {title, slug, content, description, studyTime, imageId, categories} =
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
      imageId,
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

  async getMyBlogs(paginationDto: PaginationDto) {
    const {perPage, page, skip} = Pagination(paginationDto);
    const user = this.request.user;
    const [blogs, count] = await this.blogRepository.createQueryBuilder(EntityEnum.Blog)
      .where({authorId: user.id})
      .leftJoinAndSelect("blogs.image" , 'image')
      .leftJoin("blogs.categories", "categories")
      .leftJoin("categories.category", "category")
      .loadRelationCountAndMap("blogs.likes", "blogs.likes")
      .loadRelationCountAndMap(
        "blogs.comments",
        "blogs.comments",
        "comments",
        (qb) => qb.where("comments.accepted = :accepted", {accepted: true}),
      )
      .addSelect([
        "category.title",
        "categories.id",
      ])
      .skip(skip)
      .take(perPage)
      .getManyAndCount();
    return {
      pagination: PaginationGenerator(count, page, perPage),
      blogs
    }
  }

  async findAll(paginationDto: PaginationDto, filter: BlogFilterDto) {
    let {search, category} = filter;
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
    const {perPage, page, skip} = Pagination(paginationDto);
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
        (qb) => qb.where("comments.accepted = :accepted", {accepted: true}),
      )
      .leftJoin("blogs.image", "images")
      .where(where, {category, search})
      .addSelect([
        "category.title",
        "categories.id",
        "author.id",
        "profile.nickname",
        "images.location",
        "images.alt",
        "images.name",
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

  async findOneById(id: string, userId: string = null) {
    if (!userId)
      return await this.blogRepository.findOneBy({id});
    else
      return this.blogRepository.findOneBy({
        id, authorId: userId
      })
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const {id: userId} = this.request.user;
    let {content, description, studyTime, imageId, categories, title, slug} =
      updateBlogDto;
    const blog = await this.findOneById(id, userId);
    console.log(blog)
    if (!blog) throw new NotFoundException("blog not found");
    if (slug && slug !== blog.slug) {
      const existedBlog = await this.findBlogBySlug(slug);
      if (existedBlog)
        slug = createSlug(slug) + `-${randomId()}`
    }
    blog.slug = slug;
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
    if (imageId) {
      if (blog?.image?.location.length > 0) {
        let dirname = join("public", blog.image.location);
        if (existsSync(dirname)) unlinkSync(dirname);
      }
      blog.imageId = imageId;
    }
    await this.blogRepository.save(blog);
    return {
      message: "Blog Updated Successfully",
    };
  }

  async remove(id: string) {
    const blog = await this.blogRepository.findOneBy({id});
    if (!blog) throw new BadRequestException("Blog does not exist");
    await this.blogRepository.remove(blog);
    return {
      message: "Blog removed successfully.",
    };
  }

  async findBlogBySlug(slug: string) {
    return await this.blogRepository.findOneBy({slug});
  }

  async findBlogById(id: string) {
    return await this.blogRepository.findOneBy({id});
  }

  async like(id: string) {
    const {id: userId} = this.request.user;
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
    const {id: userId} = this.request.user;
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
    const {id} = this.request.user;
    return await this.blogRepository.find({
      where: {
        bookmarks: {
          userId: id,
        },
      },
    });
  }

  async finOneBySlug(slug: string, paginationDto: PaginationDto) {
    const userId = this?.request?.user?.id;
    let blog = await this.blogRepository
      .createQueryBuilder(EntityEnum.Blog)
      .where("blogs.slug = :slug", {slug})
      .leftJoin("blogs.categories", "categories")
      .leftJoin("categories.category", "category")
      .loadRelationCountAndMap("blogs.likes", "blogs.likes")
      .loadRelationCountAndMap("blogs.bookmarks", "blogs.bookmarks")
      .loadRelationCountAndMap(
        "blogs.comments_count",
        "blogs.comments",
        "comments_count",
        (qb) =>
          qb.where("comments_count.accepted = :accepted", {accepted: true}),
      )
      .getOne();
    if (!blog) throw new NotFoundException("Blog not found");
    const isLiked = !!(await this.blogLikeRepository
      .createQueryBuilder(EntityEnum.BlogLike)
      .where({
        blogId: blog.id,
        userId,
      })
      .getOne());
    let isBookmarked = !!(await this.blogBookmarkRepository
      .createQueryBuilder(EntityEnum.BlogBookmark)
      .where({
        blogId: blog.id,
        userId,
      })
      .getOne());
    const comments = await this.blogCommentService.blogComments(
      blog.id,
      paginationDto,
    );
    return {
      isLiked,
      isBookmarked,
      ...blog,
      comments: {...comments},
    };
  }
}
