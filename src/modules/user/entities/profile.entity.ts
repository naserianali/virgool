import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {EntityEnum} from "../../../common/enums/entity.enum";
import {BaseEntity} from '../../../common/abstracts/base.entity';
import {UserEntity} from "./user.entity";

@Entity(EntityEnum.Profiles)
export class ProfileEntity extends BaseEntity {
    @Column()
    nickname: string;
    @Column({nullable: true})
    bio: string;
    @Column({nullable: true})
    image: string;
    @Column({nullable: true})
    bgImage: string;
    @Column({nullable: true})
    gender: string;
    @Column({nullable: true})
    birthday: Date;
    @Column({nullable: true})
    linkedInProfile: string;
    @Column()
    userId: string;
    @OneToOne(() => UserEntity, user => user.profile, {onDelete: "CASCADE"})
    @JoinColumn({name: 'userId'})
    user: UserEntity;

}
