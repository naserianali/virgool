import {Inject, Injectable, Scope} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {ProfileDto} from "./dto/profile.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {Repository} from "typeorm";
import {ProfileEntity} from "./entities/profile.entity";
import {REQUEST} from "@nestjs/core";
import {Request} from "express";
import {isDate} from "class-validator";
import {Gender} from "./enum/gender.enum";

@Injectable({scope: Scope.REQUEST})
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
        @Inject(REQUEST) private request: Request,
    ) {
    }

    create(createUserDto: CreateUserDto) {
        return 'This action adds a new user';
    }

    findAll() {
        return `This action returns all user`;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }

    async changeProfile(profileDto: ProfileDto) {
        const user = this.request.user;
        const {bio, linkedInProfile, nickname, gender, birthday} = profileDto;
        let profile: ProfileEntity = await this.profileRepository.findOneBy({
            user
        })
        if (profile) {
            if (bio) profile.bio = bio;
            if (linkedInProfile) profile.linkedInProfile = linkedInProfile;
            if (nickname) profile.nickname = nickname;
            if (gender && Object.values(Gender).includes(gender)) profile.gender = gender;
            if (birthday && isDate(birthday)) profile.birthday = birthday;
        } else {
            profile = this.profileRepository.create({
                linkedInProfile,
                nickname,
                gender,
                bio,
                birthday,
                user
            })
        }
        profile = await this.profileRepository.save(profile)
    }
}
