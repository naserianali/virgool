import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { EntityEnum } from "../../../common/enums/entity.enum";
import { BaseEntity } from "../../../common/abstracts/base.entity";
import { ProfileEntity } from "./profile.entity";
import { BlogEntity } from "../../blog/entities/blog.entity";
import { BlogLikeEntity } from "../../blog/entities/blog-like.entity";
import { BlogBookmarkEntity } from '../../blog/entities/blog-bookmark.entity';
import { BlogCommentEntity } from '../../blog/entities/blog-commnets.entity';

@Entity(EntityEnum.Users)
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  username: string;
  @Column({ nullable: true })
  password: string;
  @Column({ unique: true, nullable: true })
  phone: string;
  @Column({ unique: true, nullable: true })
  email: string;
  @OneToOne(() => ProfileEntity, (profile) => profile.user, { nullable: true })
  profile: ProfileEntity;
  @Column({ default: false })
  verifiedEmail: boolean;
  @Column({ default: false })
  verifiedPhone: boolean;
  @OneToMany(() => BlogEntity, (blog) => blog.author)
  blogs: BlogEntity[];
  @OneToMany(() => BlogLikeEntity, (like) => like.user, { nullable: true })
  blogLikes: BlogLikeEntity[];
  @OneToMany(() => BlogBookmarkEntity, (bookmark) => bookmark.user, {
    nullable: true,
  })
  bookmarks: BlogBookmarkEntity[];
  @OneToMany(() => BlogCommentEntity, (comment) => comment.user, {
    nullable: true,
  })
  comments: BlogBookmarkEntity[];
}
