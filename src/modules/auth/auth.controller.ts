import {Controller, Post, Body, Res} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {AuthDTO, OtpDto} from "./dto/auth.dto";
import {ApiConsumes} from "@nestjs/swagger";
import {SwaggerConsumerEnum} from "./enums/swagger.consumer.enum";
import {Response} from "express";
import {CookiesKey} from "../../common/enums/cookei.enum";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post("user-existence")
    @ApiConsumes(SwaggerConsumerEnum.UrlEncode, SwaggerConsumerEnum.Json)
    userExistence(@Body() authDto: AuthDTO, @Res() res: Response) {
        return this.authService.userExistence(authDto, res);
    }

    @Post("check-code")
    @ApiConsumes(SwaggerConsumerEnum.UrlEncode, SwaggerConsumerEnum.Json)
    checkCode(@Body() otpDto: OtpDto) {
        return this.authService.checkOtp(otpDto);
    }
}
