import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
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
import { AuthService } from "../auth/auth.service";
import { AuthMethod } from "../auth/enums/method.enum";
import { TokenService } from "../auth/token.service";
import { OtpEntity } from "./entities/otp.entity";
import { CookiesKey } from "../../common/enums/cookie.enum";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,
    @Inject(REQUEST) private request: Request,
    private authService: AuthService,
    private tokenService: TokenService,
  ) {}

  create(createUserDto: CreateUserDto) {
    return "This action adds a new user";
  }

  findAll() {
    return this.userRepository.findOne({
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
      profileImage = image.path.slice(7);
    }
    if (background_image?.length > 0) {
      let [image] = background_image;
      background_image = image.path.slice(7);
    }
    let { bio, linkedInProfile, nickname, gender, birthday, bgImage, image } =
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
        if (profile?.image?.length > 0) {
          let dirname = join("public", profile.image);
          if (existsSync(dirname)) unlinkSync(dirname);
        }
        profile.image = profileImage;
      }
      if (background_image) {
        if (profile?.bgImage?.length > 0) {
          let dirname = join("public", profile.bgImage);
          if (existsSync(dirname)) unlinkSync(dirname);
        }
        profile.bgImage = background_image;
      }
      /* console.log('img is :', profileImage);*/
      /* console.log('profile is :', background_image);*/
    } else {
      profile = this.profileRepository.create({
        linkedInProfile,
        nickname,
        gender,
        bio,
        birthday,
        user,
        image: profileImage,
        bgImage: background_image,
      });
    }
    profile = await this.profileRepository.save(profile);
    return {
      message: "Profile updated",
    };
  }

  async changeEmailOrPhone(value: string, type: AuthMethod) {
    const { id } = this.request.user;
    if (type === AuthMethod.Username)
      throw new BadRequestException("Unexpected error");
    const user = await this.userRepository.findOneBy(
      type === AuthMethod.Email ? { email: value } : { phone: value },
    );
    if (user && user.id !== id)
      throw new ConflictException("the email is already in use");
    else if (
      user &&
      user.id === id &&
      type === AuthMethod.Email &&
      user.email === value
    )
      return {
        message: "Email updated successfully",
      };
    else if (
      user &&
      user.id === id &&
      type === AuthMethod.Phone &&
      user.phone === value
    )
      return {
        message: "Email updated successfully",
      };
    const otp = await this.authService.sendOtp(type, value);
    let token: string;
    if (type === AuthMethod.Email) {
      token = await this.tokenService.generateEmailToken({
        email: value,
        method: AuthMethod.Email,
      });
    } else {
      token = await this.tokenService.generatePhoneToken({
        phone: value,
        method: AuthMethod.Email,
      });
    }
    return {
      code: otp.code,
      token,
    };
  }

  async verifyCode(code: string, type: AuthMethod) {
    const { id } = this.request.user;
    const token =
      this.request.cookies?.[
        type === AuthMethod.Email ? CookiesKey.Email_OTP : CookiesKey.Phone_OTP
      ];
    if (!token) throw new BadRequestException("token not found");
    let payload = null;
    if (type === AuthMethod.Email)
      payload = this.tokenService.verifyEmailToken(token);
    else payload = this.tokenService.verifyPhoneToken(token);
    const method: AuthMethod = payload.method;
    const username = type === AuthMethod.Email ? payload.email : payload.phone;
    if (method !== AuthMethod.Email)
      throw new ConflictException("unexpected error happened");
    const otp = await this.checkOtp(username, code);
    if (!otp) throw new BadRequestException("unexpected error happened");
    const user = await this.userRepository.findOneBy({ id });
    if (type === AuthMethod.Email) {
      user.email = username;
      user.verifiedEmail = true;
    } else {
      user.phone = username;
      user.verifiedPhone = true;
    }
    await this.userRepository.save(user);
    return {
      message: "Updated successfully",
    };
  }

  async checkOtp(username: string, code: string) {
    const otp = await this.otpRepository.findOneBy({
      username,
    });
    if (!otp) throw new UnauthorizedException("code is not exists");
    if (otp.code !== code) throw new UnauthorizedException("code is not valid");
    if (otp.expiredAt < new Date()) throw new UnauthorizedException("expired");
    return otp;
  }

  async changeUsername(username: string) {
    const { id } = this.request.user;
    const user = await this.userRepository.findOneBy({ username });
    if (user && id !== user.id)
      throw new BadRequestException("unexpected error happened");
    await this.userRepository.update(id, {
      username,
    });
    return {
      message: "username updated successfully",
    };
  }
}
