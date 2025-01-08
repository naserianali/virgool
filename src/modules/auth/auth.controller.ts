import { Controller, Post, Body, Res, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDTO, OtpDto } from "./dto/auth.dto";
import { ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { SwaggerConsumerEnum } from "./enums/swagger.consumer.enum";
import { Request, Response } from "express";
import { AuthGuard } from "./guards/auth/auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @UseGuards(AuthGuard)
  @ApiBearerAuth("Authentication")
  @ApiConsumes(SwaggerConsumerEnum.UrlEncode, SwaggerConsumerEnum.Json)
  checkToken(@Req() req: Request) {
    return req.user;
  }
}
