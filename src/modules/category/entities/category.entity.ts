import {Column, Entity} from "typeorm";
import {EntityEnum} from "../../../common/enums/entity.enum";
import {BaseEntity} from "../../../common/abstracts/base.entity";

@Entity(EntityEnum.Category)
export class CategoryEntity extends BaseEntity {
    @Column()
    title: string;
    @Column({nullable: true})
    priority: number;
}
