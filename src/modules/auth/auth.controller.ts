import {Body, Controller, Post, Req, Res} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {AuthDTO, OtpDto} from "./dto/auth.dto";
import {ApiConsumes} from "@nestjs/swagger";
import {SwaggerConsumerEnum} from "./enums/swagger.consumer.enum";
import {Request, Response} from "express";
import {AuthDecorator} from "../../common/decorators/auth.decorator";
import {CanAccess} from "../../common/decorators/role.decorator";
import {Role} from "../../common/enums/Role.enum";

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

  @Post("check-token")
  @AuthDecorator()
  // @CanAccess(Role.Admin)
  @ApiConsumes(SwaggerConsumerEnum.UrlEncode, SwaggerConsumerEnum.Json)
  checkToken(@Req() req: Request) {
    return req.user;
  }
}
