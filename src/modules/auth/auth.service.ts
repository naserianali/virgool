import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthDTO, OtpDto } from "./dto/auth.dto";
import { AuthType } from "./enums/type.enum";
import { AuthMethod } from "./enums/method.enum";
import { isEmail, isMobilePhone } from "class-validator";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { ProfileEntity } from "../user/entities/profile.entity";
import { OtpEntity } from "../user/entities/otp.entity";
import * as crypto from "node:crypto";
import { TokenService } from "./token.service";
import { Request, Response } from "express";
import { CookiesKey } from "../../common/enums/cookei.enum";
import { AuthResponse } from "./types/response";
import { REQUEST } from "@nestjs/core";

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity)
    private readonly otpRepository: Repository<OtpEntity>,
    private tokenService: TokenService,
    @Inject(REQUEST) private request: Request,
  ) {}

  async userExistence(authDto: AuthDTO, res: Response) {
    const { username, type, method } = authDto;
    let result: AuthResponse;
    switch (type) {
      case AuthType.Login:
        result = await this.login(method, username);
        return this.sendResponse(res, result);
      case AuthType.Register:
        result = await this.register(method, username);
        return this.sendResponse(res, result);
      default:
        throw new BadRequestException("the type is not valid.");
    }
  }

  async sendResponse(res: Response, result: AuthResponse) {
    res.cookie(CookiesKey.OTP, result.token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 2),
    });
    res.json({
      message: "Code Send Successfully",
      token: result.token,
      code: result.code,
    });
  }

  async login(method: AuthMethod, username: string) {
    username = this.validateUsername(method, username);
    const user: UserEntity = await this.checkExistUser(method, username);
    if (!user) throw new BadRequestException("user not found");
    const token = await this.tokenService.generateToken({
      username: username,
      method: method,
      userId: user.id,
    });
    const otp = await this.sendOtp(method, username);
    return {
      token: token,
      code: otp.code,
      method: method,
    };
  }

  async register(method: AuthMethod, username: string) {
    username = this.validateUsername(method, username);
    let user: UserEntity = await this.checkExistUser(method, username);
    if (!!user) throw new ConflictException("user already exists");
    if (method === AuthMethod.Username)
      throw new BadRequestException("user name not allow on registration");
    const otp = await this.sendOtp(method, username);
    user = this.userRepository.create({
      [method.toLowerCase()]: username,
      username,
    });
    user = await this.userRepository.save(user);
    const token = await this.tokenService.generateToken({
      username: username,
      method: method,
      userId: user.id,
    });
    return {
      token: token,
      code: otp.code,
      method: method,
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
      if (otp.expiredAt > new Date())
        throw new UnauthorizedException("Token expire time is still on ");
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
      method: method,
    };
  }

  async checkOtp(otpDto: OtpDto) {
    const token = this.request.cookies?.[CookiesKey.OTP];
    const { code } = otpDto;
    if (!token) throw new UnauthorizedException("token expired");
    const payload = this.tokenService.verifyOtpToken(token);
    const otp = await this.otpRepository.findOneBy({
      username: payload.username,
    });
    if (!otp) throw new UnauthorizedException("code is not exists");
    if (otp.code !== code) throw new UnauthorizedException("code is not valid");
    if (otp.expiredAt < new Date()) throw new UnauthorizedException("expired");
    const accessToken = await this.tokenService.generateAccessToken({
      userId: payload.userId,
    });
    if (payload.method === AuthMethod.Email)
      await this.userRepository.update(
        { id: payload.userId },
        {
          verifiedEmail: true,
        },
      );
    if (payload.method === AuthMethod.Phone)
      await this.userRepository.update(
        { id: payload.userId },
        {
          verifiedPhone: true,
        },
      );
    await this.otpRepository.remove(otp);
    return {
      message: "login successfully",
      accessToken: accessToken,
    };
  }

  async validateToken(token: string) {
    const { userId } = this.tokenService.verifyAccessToken(token);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException("please log in ut account");
    return user;
  }
}
