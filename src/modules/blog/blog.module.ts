import {Module} from '@nestjs/common';
import {BlogService} from './blog.service';
import {BlogController} from './blog.controller';
import {AuthModule} from "../auth/auth.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {BlogEntity} from "./entities/blog.entity";
import {CategoryService} from "../category/category.service";
import {CategoryEntity} from "../category/entities/category.entity";
import {BlogCategoryEntity} from "./entities/blog-category.entity";
import { BlogLikeEntity } from './entities/blog-like.entity';
import { BlogBookmarkEntity } from './entities/blog-bookmark.entity';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([
        BlogEntity,
        CategoryEntity,
        BlogCategoryEntity,
        BlogLikeEntity,
	    BlogBookmarkEntity
    ])],
    controllers: [BlogController],
    providers: [BlogService, CategoryService],
})
export class BlogModule {
}
