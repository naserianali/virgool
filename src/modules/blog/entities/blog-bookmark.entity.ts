import { BaseEntity } from "../../../common/abstracts/base.entity";
import { Column, Entity, ManyToOne } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { BlogEntity } from './blog.entity';
import { EntityEnum } from '../../../common/enums/entity.enum';

@Entity(EntityEnum.BlogBookmark)
export class BlogBookmarkEntity extends BaseEntity {
  @Column()
  blogId: string;
  @Column()
  userId: string;
  @ManyToOne(() => UserEntity, (user) => user.bookmarks, { nullable: true })
  user: UserEntity;
  @ManyToOne(() => BlogEntity, (blog) => blog.bookmarks, { nullable: true })
  blog: UserEntity;

}
