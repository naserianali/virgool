import { BaseEntity } from "../../../common/abstracts/base.entity";
import { Column, Entity, ManyToOne } from 'typeorm';
import { UserEntity } from "../../user/entities/user.entity";
import { BlogEntity } from "./blog.entity";
import { EntityEnum } from '../../../common/enums/entity.enum';

@Entity(EntityEnum.BlogLike)
export class BlogLikeEntity extends BaseEntity {
  @Column()
  blogId: string;
  @Column()
  userId: string;
  @ManyToOne(() => UserEntity, (user) => user.blogLikes, {
    onDelete: "CASCADE",
  })
  user: UserEntity;
  @ManyToOne(() => BlogEntity, (blog) => blog.likes, {
    onDelete: "CASCADE",
  })
  blog: BlogEntity;
}
