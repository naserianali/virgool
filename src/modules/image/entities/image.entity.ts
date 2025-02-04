import {BaseEntity} from "../../../common/abstracts/base.entity";
import {AfterLoad, Column, Entity, ManyToOne} from "typeorm";
import {EntityEnum} from "../../../common/enums/entity.enum";
import {UserEntity} from "../../user/entities/user.entity";
import * as process from "node:process";

@Entity(EntityEnum.Image)
export class ImageEntity extends BaseEntity {
  @Column({nullable: true})
  name: string
  @Column()
  location: string;
  @Column({nullable: true})
  src: string
  @Column({nullable: true})
  alt: string
  @Column()
  userId: string
  @ManyToOne(() => UserEntity, (user) => user.images, {onDelete: "CASCADE"})
  user: UserEntity;

  @AfterLoad()
  map() {
    this.src = `http://localhost:${process.env.PORT}/${this.location}`.replace(/\\+/g, '/');;
  }
}
