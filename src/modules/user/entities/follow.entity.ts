import {EntityEnum} from "../../../common/enums/entity.enum";
import {BaseEntity} from "../../../common/abstracts/base.entity";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {UserEntity} from "./user.entity";

@Entity(EntityEnum.Follow)
export class FollowEntity extends BaseEntity {
  @Column()
  followingId: string;
  @Column()
  followerId: string;
  @ManyToOne(() => UserEntity, user => user.following, {onDelete: "CASCADE"})
  @JoinColumn({name: 'followingId'})
  following: UserEntity;
  @ManyToOne(() => UserEntity, user => user.followers, {onDelete: "CASCADE"})
  @JoinColumn({name: 'followerId'})
  follower: UserEntity;
}