import { Column, Entity, OneToOne } from "typeorm";
import { EntityEnum } from "../../../common/enums/entity.enum";
import { BaseEntity } from "../../../common/abstracts/base.entity";
import { ProfileEntity } from "./profile.entity";

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
}
