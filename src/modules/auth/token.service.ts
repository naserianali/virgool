import {Injectable} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import * as process from "node:process";
import {CookiePayloadType} from "./types/payload";

@Injectable()
export class TokenService {
    constructor(private jwtService: JwtService) {
    }

    async generateToken(payload: CookiePayloadType) {
        const {OTP_TOKEN_SECRET} = process.env
        return this.jwtService.sign(payload, {
            secret: OTP_TOKEN_SECRET,
            expiresIn: 60 * 2
        })
    }
}
