import {BaseEntity} from "../../../common/abstracts/base.entity";
import {EntityEnum} from "../../../common/enums/entity.enum";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {UserEntity} from "../../user/entities/user.entity";
import {BlogEntity} from "./blog.entity";

@Entity(EntityEnum.BlogComment)
export class BlogCommentEntity extends BaseEntity {
    @Column()
    text: string;
    @Column({default: true})
    accepted: boolean;
    @Column()
    blogId: string;
    @ManyToOne(() => BlogEntity, (blog) => blog.comments, {onDelete: "CASCADE"})
    blog: BlogEntity;
    @Column()
    userId: string;
    @ManyToOne(() => UserEntity, (user) => user.comments, {onDelete: "CASCADE"})
    user: UserEntity;
    @Column({nullable: true})
    parentId: string;
    @ManyToOne(() => BlogCommentEntity, (parent) => parent.children, {onDelete: "CASCADE"})
    parent: BlogCommentEntity;
    @JoinColumn({name: "parent"})
    @ManyToOne(() => BlogCommentEntity, (children) => children.parent, {onDelete: "CASCADE"})
    children: BlogCommentEntity[];
}
