import {BaseEntity} from "../../../common/abstracts/base.entity";
import {Column, Entity, ManyToOne, OneToMany} from "typeorm";
import {EntityEnum} from "../../../common/enums/entity.enum";
import {BlogStatus} from "../emum/status.enum";
import {UserEntity} from "../../user/entities/user.entity";
import {BlogLikeEntity} from "./blog-like.entity";
import {BlogBookmarkEntity} from "./blog-bookmark.entity";
import {BlogCommentEntity} from './blog-commnets.entity';
import {BlogCategoryEntity} from "./blog-category.entity";

@Entity(EntityEnum.Blog)
export class BlogEntity extends BaseEntity {
    @Column()
    title: string;
    @Column({unique: true})
    slug: string;
    @Column()
    studyTime: string;
    @Column()
    description: string;
    @Column()
    content: string;
    @Column({nullable: true})
    image: string;
    @Column()
    authorId: string;
    @ManyToOne(() => UserEntity, (user) => user.blogs, {onDelete: "CASCADE"})
    author: UserEntity;
    @Column({enum: BlogStatus, default: BlogStatus.Draft})
    status: BlogStatus;
    @OneToMany(() => BlogLikeEntity, (like) => like.blog, {nullable: true})
    likes: BlogLikeEntity[];
    @OneToMany(() => BlogBookmarkEntity, (bookmark) => bookmark.blog, {
        nullable: true,
    })
    bookmarks: BlogBookmarkEntity[];
    @OneToMany(() => BlogCommentEntity, (comment) => comment.blog, {
        nullable: true,
    })
    comments: BlogCommentEntity[];
    @OneToMany(() => BlogCategoryEntity, (category) => category.blog, {
        nullable: true,
    })
    categories: BlogCategoryEntity[];
}
