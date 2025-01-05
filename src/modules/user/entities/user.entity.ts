import { Column, Entity } from "typeorm";
import { EntityEnum } from "../../../common/enums/entity.enum";
import { BaseEntity } from "../../../common/abstracts/base.entity";

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
}
