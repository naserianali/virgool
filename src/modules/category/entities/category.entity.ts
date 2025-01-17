import {Column, Entity, ManyToOne} from "typeorm";
import {EntityEnum} from "../../../common/enums/entity.enum";
import {BaseEntity} from "../../../common/abstracts/base.entity";
import {BlogCategoryEntity} from "../../blog/entities/blog-category.entity";

@Entity(EntityEnum.Category)
export class CategoryEntity extends BaseEntity {
    @Column()
    title: string;
    @Column({nullable: true})
    priority: number;
    @ManyToOne(() => BlogCategoryEntity, (blog_category) => blog_category.category)
    blogCategories: BlogCategoryEntity[];
}
