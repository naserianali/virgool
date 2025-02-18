import {AfterLoad, Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {EntityEnum} from "../../../common/enums/entity.enum";
import {BaseEntity} from '../../../common/abstracts/base.entity';
import {UserEntity} from "./user.entity";
import * as process from "node:process";

@Entity(EntityEnum.Profiles)
export class ProfileEntity extends BaseEntity {
    @Column({nullable :true})
    nickname: string;
    @Column({nullable: true})
    bio: string;
    @Column({nullable: true})
    image: string;
    @Column({nullable: true})
    bgImage: string;
    @Column({nullable: true})
    image_src: string;
    @Column({nullable: true})
    bgImage_src: string;
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
    @AfterLoad()
    map(){
        this.image_src = `${process.env.APP_URL}/${this.image}`.replace(/\\+/g, '/');
        this.bgImage_src = `${process.env.APP_URL}/${this.bgImage}`.replace(/\\+/g, '/');
    }
}
