import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import {
  ChangeEmailDto,
  ChangePhoneDto,
  ChangeUsernameDto,
  ProfileDto,
} from "./dto/profile.dto";
import { ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { SwaggerConsumerEnum } from "../auth/enums/swagger.consumer.enum";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { MulterStorage } from "../../common/untils/multer.utils";
import { AuthGuard } from "../auth/guards/auth/auth.guard";
import { Response } from "express";
import { CookiesKey } from "../../common/enums/cookei.enum";
import { OtpDto } from "../auth/dto/auth.dto";
import { AuthMethod } from "../auth/enums/method.enum";

@Controller("user")
@UseGuards(AuthGuard)
@ApiBearerAuth("Authentication")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post("check-email-otp")
  checkEmailOtp(@Body() otpDto: OtpDto) {
    return this.userService.verifyCode(otpDto.code, AuthMethod.Email);
  }

  @Post("check-phone-otp")
  checkPhoneOtp(@Body() otpDto: OtpDto) {
    return this.userService.verifyCode(otpDto.code, AuthMethod.Phone);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Patch("/change-email")
  async changeEmail(
    @Body() changeEmailDto: ChangeEmailDto,
    @Res() response: Response,
  ) {
    const { code, token, message } = await this.userService.changeEmailOrPhone(
      changeEmailDto.email,
      AuthMethod.Email,
    );
    if (message) return response.json({ message });
    response.cookie(CookiesKey.Email_OTP, token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 2),
    });
    response.json({
      code,
      message: "OTP sent",
    });
  }

  @Patch("/change-phone")
  async changePhone(
    @Body() changePhoneDto: ChangePhoneDto,
    @Res() response: Response,
  ) {
    const {
      code: code,
      token,
      message,
    } = await this.userService.changeEmailOrPhone(
      changePhoneDto.phone,
      AuthMethod.Phone,
    );
    if (message) return response.json({ message });
    response.cookie(CookiesKey.Phone_OTP, token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 2),
    });
    response.json({
      code,
      message: "OTP sent",
    });
  }

  @ApiConsumes(SwaggerConsumerEnum.MultipartData)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "image", maxCount: 1 },

        { name: "bgImage", maxCount: 1 },
      ],
      {
        storage: MulterStorage("profile"),
      },
    ),
  )
  @Put("/profile")
  changeProfile(
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [],
      }),
    )
    files: any,
    @Body()
    profileDto: ProfileDto,
  ) {
    return this.userService.changeProfile(files, profileDto);
  }

  @Patch("/change-username")
  changeUsername(@Body() changeUsernameDto: ChangeUsernameDto) {
    return this.userService.changeUsername(changeUsernameDto.username);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
