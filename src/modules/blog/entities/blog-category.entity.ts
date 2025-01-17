import {BaseEntity} from '../../../common/abstracts/base.entity';
import {Column, Entity, ManyToOne} from "typeorm";
import {EntityEnum} from "../../../common/enums/entity.enum";
import {BlogEntity} from "./blog.entity";
import {CategoryEntity} from "../../category/entities/category.entity";

@Entity(EntityEnum.BlogCategory)
export class BlogCategoryEntity extends BaseEntity {
    @Column()
    blogId: string;
    @Column()
    categoryId: string;
    @ManyToOne(() => BlogEntity, (blog) => blog.categories, {onDelete: "CASCADE"})
    blog: BlogEntity;
    @ManyToOne(() => CategoryEntity, (category) => category.blogCategories, {onDelete: "CASCADE"})
    category: CategoryEntity;
}
