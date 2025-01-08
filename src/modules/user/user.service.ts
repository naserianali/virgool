import { Inject, Injectable, Scope } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ProfileDto } from "./dto/profile.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { Repository } from "typeorm";
import { ProfileEntity } from "./entities/profile.entity";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { isDate } from "class-validator";
import { Gender } from "./enum/gender.enum";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @Inject(REQUEST) private request: Request,
  ) {}

  create(createUserDto: CreateUserDto) {
    return "This action adds a new user";
  }

  findAll() {
    return this.userRepository.find({
      where: { id: this.request.user.id },
      relations: {
        profile: true,
      },
    });
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

  async changeProfile(files: any, profileDto: ProfileDto) {
    const user = this.request.user;
    let { image: profileImage, bgImage: background_image } = files;
    if (profileImage?.length > 0) {
      let [image] = profileImage;
      profileDto.image = image.path.slice(7);
    }
    if (background_image?.length > 0) {
      let [image] = background_image;
      profileDto.bgImage = image.path.slice(7);
    }
    const { bio, linkedInProfile, nickname, gender, birthday, bgImage, image } =
      profileDto;
    let profile: ProfileEntity = await this.profileRepository.findOneBy({
      userId: user.id,
    });
    if (profile) {
      if (bio) profile.bio = bio;
      if (linkedInProfile) profile.linkedInProfile = linkedInProfile;
      if (nickname) profile.nickname = nickname;
      if (gender && Object.values(Gender).includes(gender))
        profile.gender = gender;
      if (birthday && isDate(birthday)) profile.birthday = birthday;
      if (profileImage) {
        let dirname = join("public", profile.image);
        console.log(dirname);
        if (existsSync(dirname)) unlinkSync(dirname);
        profile.image = image;
      }
      if (bgImage) {
        let dirname = join("public", profile.bgImage);
        console.log(dirname);
        if (existsSync(dirname)) unlinkSync(dirname);
        profile.bgImage = bgImage;
      }
      console.log(image);
    } else {
      profile = this.profileRepository.create({
        linkedInProfile,
        nickname,
        gender,
        bio,
        birthday,
        user,
        image: image,
        bgImage: bgImage,
      });
    }
    profile = await this.profileRepository.save(profile);
    return {
      message: "Profile updated",
    };
  }
}
