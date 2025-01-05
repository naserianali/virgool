import { Column, Entity } from "typeorm";
import { EntityEnum } from "../../../common/enums/entity.enum";
import { BaseEntity } from "../../../common/abstracts/base.entity";

@Entity(EntityEnum.Otp)
export class OtpEntity extends BaseEntity {
  @Column()
  code: string;
  @Column()
  expiredAt: Date;
  @Column()
  username: string;
}
