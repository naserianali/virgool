import { Module } from "@nestjs/common";
import { BlogService } from "./services/blog.service";
import { BlogController } from "./controllers/blog.controller";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogEntity } from "./entities/blog.entity";
import { CategoryService } from "../category/category.service";
import { CategoryEntity } from "../category/entities/category.entity";
import { BlogCategoryEntity } from "./entities/blog-category.entity";
import { BlogLikeEntity } from "./entities/blog-like.entity";
import { BlogBookmarkEntity } from "./entities/blog-bookmark.entity";
import { BlogCommentService } from "./services/comment.service";
import { BlogCommentEntity } from "./entities/blog-commnets.entity";
import { BlogCommentController } from './controllers/comment.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      BlogEntity,
      CategoryEntity,
      BlogCategoryEntity,
      BlogLikeEntity,
      BlogBookmarkEntity,
      BlogCommentEntity,
    ]),
  ],
  controllers: [BlogController , BlogCommentController],
  providers: [BlogService, CategoryService, BlogCommentService],
})
export class BlogModule {}
