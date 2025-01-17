import {Inject, Injectable, Scope} from '@nestjs/common';
import {CreateBlogDto} from './dto/create-blog.dto';
import {UpdateBlogDto} from './dto/update-blog.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {BlogEntity} from "./entities/blog.entity";
import {Repository} from "typeorm";
import {createSlug, randomId} from "../../common/untils/functions";
import {REQUEST} from "@nestjs/core";
import {Request} from "express";

@Injectable({scope: Scope.REQUEST})
export class BlogService {
    constructor(
        @InjectRepository(BlogEntity) private blogRepository: Repository<BlogEntity>,
        @Inject(REQUEST) private request: Request
    ) {
    }

    async create(createBlogDto: CreateBlogDto) {
        let {title, slug, content, description, studyTime, image} = createBlogDto;
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
        return blog;
    }

    findAll() {
        return `This action returns all blog`;
    }

    findOne(id: number) {
        return `This action returns a #${id} blog`;
    }

    update(id: number, updateBlogDto: UpdateBlogDto) {
        return `This action updates a #${id} blog`;
    }

    remove(id: number) {
        return `This action removes a #${id} blog`;
    }

    async findBlogBySlug(slug: string) {
        const blog = await this.blogRepository.findOneBy({slug})
        return !!blog;
    }
}
