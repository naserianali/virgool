import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDTO } from "./dto/auth.dto";
import { ApiConsumes } from "@nestjs/swagger";
import { SwaggerConsumerEnum } from "./enums/swagger.consumer.enum";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("user-existence")
  @ApiConsumes(SwaggerConsumerEnum.UrlEncode, SwaggerConsumerEnum.Json)
  userExistence(@Body() authDto: AuthDTO) {
    return this.authService.userExistence(authDto);
  }
}
