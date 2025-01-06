import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as process from "node:process";
import { AccessTokenPayloadType, CookiePayloadType } from './types/payload';
import { OtpDto } from "./dto/auth.dto";
import { AuthMethod } from "./enums/method.enum";

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async generateToken(payload: CookiePayloadType) {
    const { OTP_TOKEN_SECRET } = process.env;
    return this.jwtService.sign(payload, {
      secret: OTP_TOKEN_SECRET,
      expiresIn: 60 * 2,
    });
  }

  verifyOtpToken(token: string): CookiePayloadType {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.OTP_TOKEN_SECRET,
      });
    } catch (e) {
      throw new UnauthorizedException("token expired");
    }
  }
  async generateAccessToken(payload: AccessTokenPayloadType) {
    const { ACCESS_TOKEN_SECRET } = process.env;
    console.log(payload, ACCESS_TOKEN_SECRET);
    return this.jwtService.sign(payload, {
      secret: ACCESS_TOKEN_SECRET,
      expiresIn: '1y',
    });
  }

  verifyAccessToken(token: string): AccessTokenPayloadType {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
    } catch (e) {
      throw new UnauthorizedException("token expired");
    }
  }
}
