import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import {CreateUserDto} from "./dto/create-user.dto";
import {ProfileDto} from "./dto/profile.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {Repository} from "typeorm";
import {ProfileEntity} from "./entities/profile.entity";
import {REQUEST} from "@nestjs/core";
import {Request} from "express";
import {isDate} from "class-validator";
import {Gender} from "./enum/gender.enum";
import {existsSync, unlinkSync} from "fs";
import {join} from "path";
import {AuthService} from "../auth/auth.service";
import {AuthMethod} from "../auth/enums/method.enum";
import {TokenService} from "../auth/token.service";
import {OtpEntity} from "./entities/otp.entity";
import {CookiesKey} from "../../common/enums/cookie.enum";
import {BadRequestMessage, NotFoundMessage, PublicMessage} from "../../common/enums/messages.enum";
import {FollowEntity} from "./entities/follow.entity";
import {EntityEnum} from "../../common/enums/entity.enum";
import {PaginationDto} from "../../common/dto/pagination.dto";
import {Pagination, PaginationGenerator} from "../../common/untils/pagination";
import {SuspendedDto} from "./dto/suspended.dto";

@Injectable({scope: Scope.REQUEST})
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,
    @InjectRepository(FollowEntity)
    private followRepository: Repository<FollowEntity>,
    @Inject(REQUEST) private request: Request,
    private authService: AuthService,
    private tokenService: TokenService,
  ) {
  }

  create(createUserDto: CreateUserDto) {
    return "This action adds a new user";
  }

  profile() {
    const {id} = this.request.user;
    return this.userRepository.createQueryBuilder(EntityEnum.Users)
      .where({id})
      .leftJoinAndSelect("users.profile", 'profile')
      .loadRelationCountAndMap('users.followers', 'users.followers')
      .loadRelationCountAndMap('users.following', 'users.following')
      .getOne();
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async changeProfile(files: any, profileDto: ProfileDto) {
    const user = this.request.user;
    let profileImage: any, background_image: any;
    if (files) {
      ({image: profileImage, bgImage: background_image} = files);
    }
    if (profileImage?.length > 0) {
      let [image] = profileImage;
      profileImage = image.path.slice(7);
    }
    if (background_image?.length > 0) {
      let [image] = background_image;
      background_image = image.path.slice(7);
    }
    let {bio, linkedInProfile, nickname, gender, birthday, bgImage, image} =
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
    const {id} = this.request.user;
    if (type === AuthMethod.Username)
      throw new BadRequestException("Unexpected error");
    const user = await this.userRepository.findOneBy(
      type === AuthMethod.Email ? {email: value} : {phone: value},
    );
    if (user && user.id === id)
      return {
        otpSent: false,
        message: type === AuthMethod.Email ? "Email Updated Successfully" : "Phone Updated Successfully"
      }
    if (user && user.id !== id)
      throw new ConflictException(type === AuthMethod.Email ? "the email is already in use" : "the phone is already in use");
    else if (
      user &&
      user.id === id &&
      type === AuthMethod.Email &&
      user.email === value
    )
      return {
        otpSent: false,
        message: "Email updated successfully",
      };
    else if (
      user &&
      user.id === id &&
      type === AuthMethod.Phone &&
      user.phone === value
    )
      return {
        otpSent: false,
        message: "Phone updated successfully",
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
      otpSent: true,
      code: otp.code,
      token,
    };
  }

  async verifyCode(code: string, type: AuthMethod) {
    const {id} = this.request.user;
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
    const user = await this.userRepository.findOneBy({id});
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
    const {id} = this.request.user;
    const user = await this.userRepository.findOneBy({username});
    if (user && id !== user.id)
      throw new BadRequestException("unexpected error happened");
    await this.userRepository.update(id, {
      username,
    });
    return {
      message: "username updated successfully",
    };
  }

  async followToggle(followingId: string) {
    const user = this.request.user;
    const following = await this.userRepository.findOneBy({id: followingId});
    if (!following) throw new NotFoundException(NotFoundMessage.NotFoundUser);
    if (user.id === followingId) throw new BadRequestException(BadRequestMessage.InValidId)
    const isFollowing = await this.followRepository.findOneBy({followingId, followerId: user.id});
    let message = PublicMessage.Followed;
    if (isFollowing) {
      await this.followRepository.remove(isFollowing);
      message = PublicMessage.UnFollow;
    } else await this.followRepository.insert({
      followingId,
      followerId: user.id
    });
    return {
      message
    };
  }

  async followers(paginationDto: PaginationDto) {
    const {page, perPage, skip} = Pagination(paginationDto);
    const {id} = this.request.user;
    const [following, count] = await this.followRepository.findAndCount({
      where: {followingId: id},
      relations: {
        follower: {
          profile: true,
        }
      },
      select: {
        follower: {
          id: true,
          username: true,
          profile: {
            nickname: true
          }
        }
      },
      skip,
      take: perPage
    })
    return {
      pagination: PaginationGenerator(count, page, perPage),
      following
    }
  }

  async following(paginationDto: PaginationDto) {
    const {page, perPage, skip} = Pagination(paginationDto);
    const {id} = this.request.user;
    const [following, count] = await this.followRepository.findAndCount({
      where: {followerId: id},
      relations: {
        follower: {
          profile: true,
        }
      },
      select: {
        follower: {
          id: true,
          username: true,
          profile: {
            nickname: true
          }
        }
      },
      skip,
      take: perPage
    })
    return {
      pagination: PaginationGenerator(count, page, perPage),
      following
    }
  }

  async toggleSuspended(suspendedDto: SuspendedDto) {
    const {userId} = suspendedDto
    const user = await this.userRepository.findOneBy({id: userId})
    if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser)
    console.log(user)
    let message = PublicMessage.Blocked;
    if (user?.suspended) {
      user.suspended = false;
      message = PublicMessage.UnBlocked;
    } else
      user.suspended = true;
    await this.userRepository.save(user)
    return {
      message
    }
  }
}
