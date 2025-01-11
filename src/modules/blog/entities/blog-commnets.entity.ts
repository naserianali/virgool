import { BaseEntity } from "../../../common/abstracts/base.entity";
import { EntityEnum } from "../../../common/enums/entity.enum";
import { Column, Entity, ManyToOne } from "typeorm";
import { UserEntity } from "../../user/entities/user.entity";
import { BlogEntity } from "./blog.entity";

@Entity(EntityEnum.BlogComment)
export class BlogCommentEntity extends BaseEntity {
  @Column()
  text: string;
  @Column({ default: false })
  accepted: boolean;
  @Column()
  blogId: string;
  @ManyToOne(() => BlogEntity, (blog) => blog.comments, { onDelete: "CASCADE" })
  blog: BlogEntity;
  @Column()
  userId: string;
  @ManyToOne(() => UserEntity, (user) => user.comments, { onDelete: "CASCADE" })
  user: UserEntity;
  @Column()
  parentId: string;
}
