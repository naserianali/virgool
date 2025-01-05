import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { AuthDTO } from "./dto/auth.dto";
import { AuthType } from "./enums/type.enum";
import { AuthMethod } from "./enums/method.enum";
import { isEmail, isMobilePhone } from "class-validator";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { ProfileEntity } from "../user/entities/profile.entity";
import { OtpEntity } from "../user/entities/otp.entity";
import * as crypto from "node:crypto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity)
    private readonly otpRepository: Repository<OtpEntity>,
  ) {}

  async userExistence(authDto: AuthDTO) {
    const { username, type, method } = authDto;
    switch (type) {
      case AuthType.Login:
        return this.login(method, username);
      case AuthType.Register:
        return this.register(method, username);
      default:
        throw new BadRequestException("the type is not valid.");
    }
  }

  async login(method: AuthMethod, username: string) {
    username = this.validateUsername(method, username);
    const user: UserEntity = await this.checkExistUser(method, username);
    if (!user) throw new BadRequestException("user not found");
    return this.sendOtp(method, username);
  }

  async register(method: AuthMethod, username: string) {
    username = this.validateUsername(method, username);
    let user: UserEntity = await this.checkExistUser(method, username);
    if ((!!user)) throw new ConflictException("user already exists");
    if (method === AuthMethod.Username)
      throw new BadRequestException("user name not allow on registration");
    const otp = await this.sendOtp(method, username);
    user = this.userRepository.create({
      [method.toLowerCase()]: username,
      username,
    });
    user = await this.userRepository.save(user);
    return {
      user: user,
      otp: otp.code,
    };
  }

  async checkExistUser(method: AuthMethod, username: string) {
    if (method === AuthMethod.Phone)
      return await this.userRepository.findOneBy({ phone: username });
    else if (method === AuthMethod.Email)
      return await this.userRepository.findOneBy({ email: username });
    else if (method === AuthMethod.Username)
      return await this.userRepository.findOneBy({ username });
    else throw new BadRequestException("the login values is not valid.");
  }

  validateUsername(method: AuthMethod, username: string) {
    switch (method) {
      default:
      case AuthMethod.Username:
        return username;
      case AuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException("the email address is invalid.");
      case AuthMethod.Phone:
        if (isMobilePhone(username, "fa-IR")) return username;
        throw new BadRequestException("the phone number is invalid.");
    }
  }

  async sendOtp(method: AuthMethod, username: string) {
    const code = crypto.randomInt(10000, 99999).toString();
    const expiredAt = new Date(Date.now() + 1000 * 60 * 2);
    let otp = await this.otpRepository.findOneBy({ username });
    if (otp) {
      otp.code = code;
      otp.expiredAt = expiredAt;
    } else {
      otp = this.otpRepository.create({
        username,
        code,
        expiredAt,
      });
    }
    otp = await this.otpRepository.save(otp);
    return {
      message: "code sent successfully",
      code: otp.code,
    };
  }
}
