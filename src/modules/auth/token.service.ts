import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as process from "node:process";
import {
  AccessTokenPayloadType,
  CookiePayloadType,
  EmailTokenPayloadType,
  PhoneTokenPayloadType,
} from "./types/payload";

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
    return this.jwtService.sign(payload, {
      secret: ACCESS_TOKEN_SECRET,
      expiresIn: "1y",
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

  async generateEmailToken(payload: EmailTokenPayloadType) {
    const { EMAIL_TOKEN_SECRET } = process.env;
    return this.jwtService.sign(payload, {
      secret: EMAIL_TOKEN_SECRET,
      expiresIn: 60 * 2,
    });
  }

  verifyEmailToken(token: string): EmailTokenPayloadType {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.EMAIL_TOKEN_SECRET,
      });
    } catch (e) {
      throw new BadRequestException("unexpected error happened");
    }
  }

  async generatePhoneToken(payload: PhoneTokenPayloadType) {
    const { PHONE_TOKEN_SECRET } = process.env;
    return this.jwtService.sign(payload, {
      secret: PHONE_TOKEN_SECRET,
      expiresIn: 60 * 2,
    });
  }

  verifyPhoneToken(token: string): PhoneTokenPayloadType {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.PHONE_TOKEN_SECRET,
      });
    } catch (e) {
      throw new BadRequestException("unexpected error happened");
    }
  }
}
