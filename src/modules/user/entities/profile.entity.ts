import { BaseEntity, Column, Entity } from "typeorm";
import { EntityEnum } from "../../../common/enums/entity.enum";

@Entity(EntityEnum.Profiles)
export class ProfileEntity extends BaseEntity {
  @Column()
  nickname: string;
  @Column({ nullable: true })
  bio: string;
  @Column({ nullable: true })
  image: string;
  @Column({ nullable: true })
  bgImage: string;
  @Column({ nullable: true })
  gender: string;
  @Column({ nullable: true })
  birthday: Date;
  @Column({ nullable: true })
  linkedInProfile: string;
}
