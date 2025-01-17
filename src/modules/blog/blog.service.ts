import {BadRequestException, Inject, Injectable, Scope} from '@nestjs/common';
import {BlogFilterDto, CreateBlogDto} from './dto/create-blog.dto';
import {UpdateBlogDto} from './dto/update-blog.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {BlogEntity} from "./entities/blog.entity";
import {Repository} from "typeorm";
import {createSlug, randomId} from "../../common/untils/functions";
import {REQUEST} from "@nestjs/core";
import {Request} from "express";
import {PaginationDto} from "../../common/dto/pagination.dto";
import {Pagination, PaginationGenerator} from "../../common/untils/pagination";
import {isArray} from "class-validator";
import {CategoryService} from "../category/category.service";
import {BlogCategoryEntity} from "./entities/blog-category.entity";
import {EntityEnum} from "../../common/enums/entity.enum";

@Injectable({scope: Scope.REQUEST})
export class BlogService {
    constructor(
        @InjectRepository(BlogEntity) private blogRepository: Repository<BlogEntity>,
        @InjectRepository(BlogCategoryEntity) private blogCategoryRepository: Repository<BlogCategoryEntity>,
        @Inject(REQUEST) private request: Request,
        private categoryService: CategoryService
    ) {
    }

    async create(createBlogDto: CreateBlogDto) {
        let {title, slug, content, description, studyTime, image, categories} = createBlogDto;
        if (!isArray(categories)) {
            throw new BadRequestException("Categories must be an array");
        }
        const user = this.request.user;
        slug = createSlug(slug ?? title);
        const isExists = this.findBlogBySlug(slug);
        if (isExists) slug += `-${randomId()}`
        let blog = this.blogRepository.create({
            title,
            slug,
            content,
            description,
            studyTime,
            image,
            authorId: user.id
        });
        blog = await this.blogRepository.save(blog);
        for (const categoryTitle of categories) {
            let category = await this.categoryService.findOneByTitle(categoryTitle)
            if (!category) category = await this.categoryService.insetByTitle(categoryTitle)
            await this.blogCategoryRepository.insert({
                blogId: blog.id,
                categoryId: category.id
            })
        }
        return {
            message: 'Blog created successfully.',
        };
    }

    async getMyBlogs() {
        const user = this.request.user;
        return await this.blogRepository.find({
            where: {
                authorId: user.id
            },
            order: {
                createdAt: "DESC"
            }
        });
    }

    async findAll(paginationDto: PaginationDto, filter: BlogFilterDto) {
        let {search, category} = filter;
        let where: string = ""
        if (category) {
            category = category.toLowerCase();
            if (where.length > 0) where += " AND "
            where += "category.title = LOWER(:category)"
        }
        if (search) {
            if (where.length > 0) where += " AND "
            search = `%${search}%`
            where += "CONCAT(blogs.title , blogs.content , blogs.description) ILIKE :search"
        }
        const {perPage, page, skip} = Pagination(paginationDto);
        const [blogs, count] = await this.blogRepository.createQueryBuilder(EntityEnum.Blog)
            .leftJoin("blogs.categories", 'categories')
            .leftJoin("categories.category", 'category')
            .where(where, {category, search})
            .addSelect(["category.title", 'categories.id'])
            .skip(skip)
            .take(perPage)
            .orderBy('blogs.createdAt', 'DESC')
            .getManyAndCount()
        return {
            pagination: PaginationGenerator(count, page, perPage),
            blogs,
        }
    }

    findOne(id: number) {
        return `This action returns a #${id} blog`;
    }

    update(id: number, updateBlogDto: UpdateBlogDto) {
        return `This action updates a #${id} blog`;
    }

    async remove(id: string) {
        const blog = await this.blogRepository.findOneBy({id})
        if (!blog) throw new BadRequestException("Blog does not exist");
        await this.blogRepository.remove(blog)
        return {
            message: 'Blog removed successfully.',
        };
    }

    async findBlogBySlug(slug: string) {
        const blog = await this.blogRepository.findOneBy({slug})
        return !!blog;
    }
}
